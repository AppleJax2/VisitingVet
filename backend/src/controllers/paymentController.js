const stripe = require('../services/stripeService');
const asyncHandler = require('../middleware/asyncHandler');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');
const VisitingVetProfile = require('../models/VisitingVetProfile');
const config = require('../config/config');
const { PLATFORM_FEE_PERCENTAGE } = require('../config/constants');
const notificationService = require('../services/notificationService');

/**
 * @desc    Create a Stripe Payment Intent for an appointment
 * @route   POST /api/v1/payments/create-intent
 * @access  Private (PetOwner)
 */
exports.createPaymentIntent = asyncHandler(async (req, res, next) => {
  const { appointmentId } = req.body;
  const userId = req.user.id; // Pet owner paying

  if (!appointmentId) {
    return next(new ErrorResponse('Appointment ID is required', 400));
  }

  // 1. Fetch Appointment, Service, and Provider Profile
  const appointment = await Appointment.findById(appointmentId)
                                       .populate('serviceId')
                                       .populate({
                                           path: 'providerProfileId', // Assuming this field links to VisitingVetProfile
                                           select: 'user stripeAccountId stripeChargesEnabled stripePayoutsEnabled' // Select necessary Stripe fields
                                       });

  if (!appointment) {
    return next(new ErrorResponse(`Appointment not found with id of ${appointmentId}`, 404));
  }
  if (!appointment.providerProfileId) {
    return next(new ErrorResponse(`Provider profile not linked for appointment ${appointmentId}`, 500));
  }
  if (!appointment.serviceId || typeof appointment.serviceId.price !== 'number') {
    return next(new ErrorResponse('Service details or price missing/invalid for this appointment', 400));
  }

  const providerProfile = appointment.providerProfileId;
  const providerStripeAccountId = providerProfile.stripeAccountId;

  // --- Authorization Check ---
  // TODO: Enhance this check for clinic-initiated scenarios later
  if (appointment.petOwnerId.toString() !== userId) {
      return next(new ErrorResponse('User not authorized to pay for this appointment', 403));
  }

  // --- Check Provider Stripe Account Status ---
  if (!providerStripeAccountId || !providerProfile.stripeChargesEnabled || !providerProfile.stripePayoutsEnabled) {
      console.error(`Provider ${providerProfile._id} cannot receive payments. Stripe Account ID: ${providerStripeAccountId}, Charges Enabled: ${providerProfile.stripeChargesEnabled}, Payouts Enabled: ${providerProfile.stripePayoutsEnabled}`);
      // TODO: Notify admin/provider?
      return next(new ErrorResponse('The service provider is not currently set up to receive payments.', 503)); // 503 Service Unavailable
  }

  // --- Payment Existence Check ---
  const existingPayment = await Payment.findOne({ appointmentId: appointmentId, status: { $in: ['succeeded', 'pending', 'requires_action'] } });
  if (existingPayment) {
      if (existingPayment.status === 'succeeded') {
          return next(new ErrorResponse('This appointment has already been paid', 400));
      }
      // Consider returning existing client secret if pending/requires_action?
       return next(new ErrorResponse('A payment for this appointment is already pending', 400));
  }

  // --- Calculate Amounts --- 
  const totalAmount = Math.round(appointment.serviceId.price * 100); // Price in cents
  const currency = 'usd'; 
  const applicationFeeAmount = Math.round(totalAmount * PLATFORM_FEE_PERCENTAGE);

  if (applicationFeeAmount >= totalAmount || applicationFeeAmount < 0) {
      console.error(`Invalid Platform fee (${applicationFeeAmount}) calculated for total amount (${totalAmount}). Check constant.`);
      return next(new ErrorResponse('Internal error calculating payment amounts', 500));
  }

  // 2. Find or Create Stripe Customer for the Pet Owner
  let petOwnerUser = await User.findById(userId);
  let stripeCustomerId = petOwnerUser.stripeCustomerId;

  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: petOwnerUser.email,
        name: petOwnerUser.name,
        metadata: { userId: userId },
      });
      stripeCustomerId = customer.id;
      petOwnerUser.stripeCustomerId = stripeCustomerId;
      await petOwnerUser.save();
    } catch (err) {
      console.error('Error creating Stripe customer:', err);
      return next(new ErrorResponse('Failed to create payment customer', 500));
    }
  }

  // 3. Create Payment Intent with Destination Charge (transfer_data)
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: currency,
      customer: stripeCustomerId,
      application_fee_amount: applicationFeeAmount, // Platform fee
      transfer_data: {
        destination: providerStripeAccountId, // Transfer remaining amount to provider
      },
      metadata: {
        appointmentId: appointmentId.toString(),
        userId: userId, // Pet Owner paying
        providerUserId: providerProfile.user.toString(), // ID of the provider user
        serviceId: appointment.serviceId._id.toString(),
      },
      automatic_payment_methods: { enabled: true },
      description: `Vet Visit: ${appointment.serviceId.name} - Appt ${appointmentId}`,
      receipt_email: petOwnerUser.email, 
      // statement_descriptor: 'VISITINGVET', // Max 22 chars
      // statement_descriptor_suffix: 'Vet Service', // Max 22 chars, appears after provider name on statement
    });
  } catch (err) {
    console.error('Error creating Stripe Payment Intent with transfer_data:', err);
    // Check for specific errors (e.g., invalid destination account)
    return next(new ErrorResponse('Failed to create payment intent', 500));
  }

  // 4. Create Payment Record in DB 
  try {
    await Payment.create({
      userId: userId,
      appointmentId: appointmentId,
      providerId: providerProfile.user, // Store provider user ID for easier lookup
      amount: totalAmount,
      platformFee: applicationFeeAmount, // Store calculated fee
      currency: currency,
      status: paymentIntent.status, 
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId: stripeCustomerId,
      stripeDestinationAccountId: providerStripeAccountId, // Store destination account
    });
  } catch (err) {
    console.error('Error creating payment record in DB:', err);
    // CRITICAL: Try to cancel the Payment Intent if DB save fails?
    try {
        await stripe.paymentIntents.cancel(paymentIntent.id);
    } catch (cancelErr) {
        console.error(`CRITICAL Error: Failed to cancel Stripe Payment Intent ${paymentIntent.id} after DB error:`, cancelErr);
        // Log this for immediate manual intervention
    }
    return next(new ErrorResponse('Failed to save payment record after initiating payment', 500));
  }

  // 5. Send Client Secret to Frontend
  res.status(201).json({
    clientSecret: paymentIntent.client_secret,
    paymentId: paymentIntent.id,
  });
});

/**
 * @desc    Handle Stripe Webhook Events
 * @route   POST /api/v1/payments/webhook
 * @access  Public (Webhook from Stripe)
 */
exports.handleStripeWebhook = asyncHandler(async (req, res, next) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = require('../config/config').stripe.webhookSecret;
  let event;

  try {
    // Verify webhook signature using req.body (which contains the raw buffer)
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle Connect events if the webhook is configured for them
  if (event.account) {
      console.log(`Received Connect event for account ${event.account}: ${event.type}`);
      // Handle account.updated, capability.updated, etc.
      switch (event.type) {
          case 'account.updated':
              const account = event.data.object;
              await updateProfileFromStripeAccount(account.id, account);
              break;
          // Add other relevant Connect event handlers
          // case 'capability.updated':
          //     const capability = event.data.object;
          //     // Check if related to card_payments or transfers
          //     await updateProfileFromStripeAccount(event.account); // Re-fetch or use capability data
          //     break;
          // case 'payout.paid':
          //     // Track provider payouts if needed
          //     break;
      }
      // Acknowledge Connect event
      return res.json({ received: true });
  }

  // Handle non-Connect events (existing payment intent logic)
  let userIdToNotify = null;
  let providerIdToNotify = null;
  let notificationType = null;
  let notificationData = {};
  
  // Extract relevant IDs from metadata if possible (especially for failures)
  const metadata = event.data.object.metadata;
  if (metadata) {
      userIdToNotify = metadata.userId;
      providerIdToNotify = metadata.providerUserId;
      notificationData.appointmentId = metadata.appointmentId;
      notificationData.serviceId = metadata.serviceId;
      // Add more relevant data if needed
  }
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      await updatePaymentStatus(paymentIntentSucceeded.id, 'succeeded', paymentIntentSucceeded);
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      await updatePaymentStatus(paymentIntentFailed.id, 'failed', paymentIntentFailed);
      // Notify the user about the failure
      if (userIdToNotify) {
           await notificationService.createNotification(userIdToNotify, 'payment_failed', {
              appointmentId: notificationData.appointmentId,
              reason: paymentIntentFailed.last_payment_error?.message || 'Unknown reason',
              amount: paymentIntentFailed.amount / 100, // Convert to dollars
              currency: paymentIntentFailed.currency,
           });
      }
      break;
    case 'payment_intent.canceled':
      const paymentIntentCanceled = event.data.object;
      await updatePaymentStatus(paymentIntentCanceled.id, 'canceled', paymentIntentCanceled);
      break;
    case 'payment_intent.processing':
        const paymentIntentProcessing = event.data.object;
        await updatePaymentStatus(paymentIntentProcessing.id, 'processing', paymentIntentProcessing);
        break;
    case 'payment_intent.requires_action':
        const paymentIntentRequiresAction = event.data.object;
        await updatePaymentStatus(paymentIntentRequiresAction.id, 'requires_action', paymentIntentRequiresAction);
        break;
    // Handle other event types as needed (e.g., refunds, disputes)
    case 'charge.refunded':
      const chargeRefunded = event.data.object;
      await updatePaymentStatusOnRefund(chargeRefunded.payment_intent, 'refunded', chargeRefunded);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({ received: true });
});

// Helper function to update payment status in DB
const updatePaymentStatus = async (paymentIntentId, newStatus, paymentIntentData) => {
  try {
    const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
    if (!payment) {
      console.error(`Payment record not found for PaymentIntent ID: ${paymentIntentId}`);
      // Potentially create a payment record if missing but succeeded?
      // This case shouldn't happen if createPaymentIntent works correctly.
      return;
    }

    // Avoid overwriting a final state like 'succeeded' with 'processing' if webhooks arrive out of order
    const finalStates = ['succeeded', 'failed', 'canceled', 'refunded'];
    if (finalStates.includes(payment.status) && payment.status !== newStatus) {
        // If the current status is final and different from the new status, log and potentially investigate.
        // Exception: Allow updating from succeeded to refunded.
        if (!(payment.status === 'succeeded' && newStatus === 'refunded')) {
             console.warn(`Attempted to update payment ${payment._id} from final status ${payment.status} to ${newStatus}. Ignoring.`);
             return;
        }
    }

    payment.status = newStatus;

    // Store payment method details on success
    if (newStatus === 'succeeded' && paymentIntentData.charges && paymentIntentData.charges.data.length > 0) {
      const charge = paymentIntentData.charges.data[0];
      if (charge.payment_method_details) {
        payment.paymentMethodDetails = {
          type: charge.payment_method_details.type,
          cardBrand: charge.payment_method_details.card?.brand,
          cardLast4: charge.payment_method_details.card?.last4,
        };
      }
    }

    await payment.save();
    console.log(`Updated payment ${payment._id} status to ${newStatus}`);

    // --- Post-payment actions --- 
    if (newStatus === 'succeeded') {
        // Mark Appointment as Paid (Consider adding a 'paymentStatus' field to Appointment model)
        await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'Paid' }); 
        console.log(`Marked appointment ${payment.appointmentId} as Paid.`);
        
        // Notify provider about payment confirmation
        if (payment.providerId) {
            await notificationService.createNotification(payment.providerId, 'payment_received', {
                appointmentId: payment.appointmentId,
                amount: payment.amount / 100,
                currency: payment.currency,
                clientUserId: payment.userId,
            });
        }
        // Notify pet owner about payment success
        if (payment.userId) {
             await notificationService.createNotification(payment.userId, 'payment_success', {
                appointmentId: payment.appointmentId,
                amount: payment.amount / 100,
                currency: payment.currency,
                providerId: payment.providerId, 
            });
        }
    }
    // Add other post-action triggers (e.g., notifications on failure)

  } catch (error) {
    console.error(`Error updating payment status for PaymentIntent ID: ${paymentIntentId}:`, error);
    // Log critical error for monitoring/alerting
  }
};

// Helper function to update payment status based on charge refund
const updatePaymentStatusOnRefund = async (paymentIntentId, newStatus, chargeData) => {
    try {
        const payment = await Payment.findOne({ stripePaymentIntentId: paymentIntentId });
        if (!payment) {
            console.error(`Payment record not found for refunded PaymentIntent ID: ${paymentIntentId}`);
            return;
        }

        payment.status = newStatus; // Mark as 'refunded'
        payment.refundedAmount = (payment.refundedAmount || 0) + chargeData.amount_refunded;

        // Check if fully refunded
        if (payment.refundedAmount >= payment.amount) {
            console.log(`Payment ${payment._id} is fully refunded.`);
        } else {
            console.log(`Payment ${payment._id} is partially refunded. Total refunded: ${payment.refundedAmount}`);
            // Keep status as 'refunded' even for partial refunds, or use a different status like 'partially_refunded'?
            // For simplicity, 'refunded' indicates at least some amount was refunded.
        }

        await payment.save();
        console.log(`Updated payment ${payment._id} status to ${newStatus} due to refund.`);

        // --- Post-refund actions ---
        // Update appointment status (e.g., back to 'Pending Payment' or 'Refunded')
        await Appointment.findByIdAndUpdate(payment.appointmentId, { paymentStatus: 'Refunded' }); 
        console.log(`Marked appointment ${payment.appointmentId} as Refunded.`);
        
        // Notify relevant parties about the refund
        const refundAmount = chargeData.amount_refunded / 100;
        const currency = chargeData.currency;
        const appointmentId = payment.appointmentId;

        // Notify provider
        if (payment.providerId) {
             await notificationService.createNotification(payment.providerId, 'payment_refunded', {
                appointmentId: appointmentId,
                refundAmount: refundAmount,
                currency: currency,
                clientUserId: payment.userId,
             });
        }
        // Notify pet owner
        if (payment.userId) {
             await notificationService.createNotification(payment.userId, 'payment_refunded', {
                appointmentId: appointmentId,
                refundAmount: refundAmount,
                currency: currency,
                providerId: payment.providerId, 
             });
        }

    } catch (error) {
        console.error(`Error updating payment status on refund for PaymentIntent ID: ${paymentIntentId}:`, error);
    }
};

/**
 * @desc    Create a Stripe Connect Account Link for provider onboarding
 * @route   POST /api/v1/payments/create-connect-account-link
 * @access  Private (MVSProvider)
 */
exports.createConnectAccountLink = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    // 1. Find the provider's profile
    const profile = await VisitingVetProfile.findOne({ user: userId });
    if (!profile) {
        return next(new ErrorResponse('Provider profile not found', 404));
    }

    // 2. Get or create the Stripe Connect account ID
    let stripeAccountId = profile.stripeAccountId;
    if (!stripeAccountId) {
        try {
            const account = await stripe.accounts.create({
                type: 'express',
                country: 'US', // Or determine dynamically if needed
                email: req.user.email, // Pre-fill email from user model
                metadata: {
                    userId: userId.toString(),
                    profileId: profile._id.toString(),
                },
                // Add capabilities if needed (e.g., card_payments, transfers)
                capabilities: {
                    card_payments: {requested: true},
                    transfers: {requested: true},
                },
                business_type: 'individual', // Assume individual for now, might need more info
                // You might need to pre-fill more info depending on requirements
            });
            stripeAccountId = account.id;
            profile.stripeAccountId = stripeAccountId;
            profile.stripeAccountStatus = 'onboarding_incomplete'; 
            await profile.save();
        } catch (err) {
            console.error('Error creating Stripe Connect account:', err);
            return next(new ErrorResponse('Failed to create Stripe Connect account', 500));
        }
    }

    // 3. Create the Account Link
    try {
        const accountLink = await stripe.accountLinks.create({
            account: stripeAccountId,
            refresh_url: `${config.app.frontendUrl}/stripe/connect/refresh`, // URL to redirect if link expires
            return_url: `${config.app.frontendUrl}/stripe/connect/return`, // URL to redirect after completing onboarding
            type: 'account_onboarding',
            collect: 'eventually_due', // Collect required info now or later
        });

        res.status(200).json({ url: accountLink.url });

    } catch (err) {
        console.error('Error creating Stripe Account Link:', err);
        // If account is restricted, might need different link type or handling
        return next(new ErrorResponse('Failed to create Stripe onboarding link', 500));
    }
});

/**
 * @desc    Retrieve Stripe Account details for the logged-in provider
 * @route   GET /api/v1/payments/stripe-account
 * @access  Private (MVSProvider)
 */
exports.getStripeAccount = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const profile = await VisitingVetProfile.findOne({ user: userId });

    if (!profile || !profile.stripeAccountId) {
        return next(new ErrorResponse('Stripe account not found or not linked', 404));
    }

    try {
        const account = await stripe.accounts.retrieve(profile.stripeAccountId);

        // Update local profile status based on Stripe data (important!)
        profile.stripeChargesEnabled = account.charges_enabled;
        profile.stripePayoutsEnabled = account.payouts_enabled;
        // Map Stripe status more robustly if needed
        if (account.requirements?.disabled_reason) {
             profile.stripeAccountStatus = 'disabled';
        } else if (account.requirements?.currently_due?.length > 0 || account.requirements?.eventually_due?.length > 0) {
            profile.stripeAccountStatus = account.requirements?.past_due?.length > 0 ? 'restricted' : 'pending_verification';
        } else if (account.charges_enabled && account.payouts_enabled) {
             profile.stripeAccountStatus = 'verified';
        } else {
             profile.stripeAccountStatus = 'onboarding_incomplete'; // Fallback
        }
        await profile.save();

        res.status(200).json({
            accountId: account.id,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            detailsSubmitted: account.details_submitted,
            status: profile.stripeAccountStatus, // Return our mapped status
            requirements: account.requirements, // Pass requirements for frontend handling
        });
    } catch (err) {
        console.error('Error retrieving Stripe account:', err);
        return next(new ErrorResponse('Failed to retrieve Stripe account details', 500));
    }
});

// Helper function to update profile based on Stripe account data (used by webhook and potentially getStripeAccount)
const updateProfileFromStripeAccount = async (stripeAccountId, accountData) => {
    try {
        const profile = await VisitingVetProfile.findOne({ stripeAccountId: stripeAccountId });
        if (!profile) {
            console.error(`Webhook Error: Profile not found for Stripe Account ID ${stripeAccountId}`);
            return; // Or throw error
        }

        // If full account data isn't passed (e.g., from some events), fetch it
        if (!accountData) {
            accountData = await stripe.accounts.retrieve(stripeAccountId);
        }

        profile.stripeChargesEnabled = accountData.charges_enabled;
        profile.stripePayoutsEnabled = accountData.payouts_enabled;

        // Determine status based on requirements and capabilities
        const requirements = accountData.requirements;
        let newStatus = 'onboarding_incomplete'; // Default

        if (requirements?.disabled_reason) {
            newStatus = 'disabled';
        } else if (requirements?.past_due?.length > 0) {
            newStatus = 'restricted'; 
        } else if (requirements?.currently_due?.length > 0 || requirements?.eventually_due?.length > 0) {
            newStatus = 'pending_verification';
        } else if (accountData.charges_enabled && accountData.payouts_enabled) {
            newStatus = 'verified';
        } 

        if (profile.stripeAccountStatus !== newStatus) {
            profile.stripeAccountStatus = newStatus;
            console.log(`Updating profile ${profile._id} Stripe status to ${newStatus} for account ${stripeAccountId}`);
        } else {
             console.log(`Profile ${profile._id} Stripe status already ${newStatus} for account ${stripeAccountId}. No update needed.`);
        }

        await profile.save();

    } catch (error) {
        console.error(`Error updating profile from Stripe account ${stripeAccountId}:`, error);
        // Add monitoring/alerting here
    }
};

/**
 * @desc    Get payment history for the logged-in Pet Owner
 * @route   GET /api/v1/payments/my-history
 * @access  Private (PetOwner)
 */
exports.getPetOwnerPaymentHistory = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    const payments = await Payment.find({ userId: userId })
        .populate({
            path: 'appointmentId',
            select: 'appointmentTime status serviceId',
            populate: {
                path: 'serviceId',
                select: 'name'
            }
        })
        .populate({
            path: 'providerId', // User ref for provider
            select: 'name' // Select provider name
        })
        .sort({ createdAt: -1 }); // Sort by most recent

    // Format data for frontend if needed
    const formattedPayments = payments.map(p => ({
        id: p._id,
        date: p.createdAt,
        amount: p.amount / 100, // Convert cents to dollars
        currency: p.currency,
        status: p.status,
        appointmentDate: p.appointmentId?.appointmentTime,
        serviceName: p.appointmentId?.serviceId?.name,
        providerName: p.providerId?.name,
        paymentIntentId: p.stripePaymentIntentId,
    }));

    res.status(200).json({ success: true, count: formattedPayments.length, data: formattedPayments });
});

/**
 * @desc    Get payment history for the logged-in MVS Provider
 * @route   GET /api/v1/payments/provider-history
 * @access  Private (MVSProvider)
 */
exports.getProviderPaymentHistory = asyncHandler(async (req, res, next) => {
    const providerUserId = req.user.id;

    // Find payments where the provider was the recipient
    const payments = await Payment.find({ providerId: providerUserId })
        .populate({
            path: 'appointmentId',
            select: 'appointmentTime status serviceId petOwnerId',
            populate: [
                { path: 'serviceId', select: 'name' },
                { path: 'petOwnerId', select: 'name email' } // Include pet owner details
            ]
        })
        .sort({ createdAt: -1 });

    // Format data for frontend
    const formattedPayments = payments.map(p => ({
        id: p._id,
        date: p.createdAt,
        totalAmount: p.amount / 100,
        platformFee: p.platformFee / 100,
        netAmount: (p.amount - p.platformFee) / 100,
        currency: p.currency,
        status: p.status,
        appointmentDate: p.appointmentId?.appointmentTime,
        serviceName: p.appointmentId?.serviceId?.name,
        petOwnerName: p.appointmentId?.petOwnerId?.name, 
        // Consider privacy: maybe only show Pet Owner ID or initials?
        petOwnerEmail: p.appointmentId?.petOwnerId?.email, 
        paymentIntentId: p.stripePaymentIntentId,
    }));

    res.status(200).json({ success: true, count: formattedPayments.length, data: formattedPayments });
});

/**
 * @desc    Get all payment history (for Admin)
 * @route   GET /api/v1/payments/admin-history
 * @access  Private (Admin)
 */
exports.getAdminPaymentHistory = asyncHandler(async (req, res, next) => {
    // TODO: Add pagination, filtering (by user, provider, status, date range)
    const payments = await Payment.find({}) // Find all
        .populate({ path: 'userId', select: 'name email role' }) // Payer (PetOwner/Clinic)
        .populate({ path: 'providerId', select: 'name email' }) // Provider
        .populate({
            path: 'appointmentId',
            select: 'appointmentTime status serviceId',
            populate: { path: 'serviceId', select: 'name' }
        })
        .sort({ createdAt: -1 });

     // Format data
    const formattedPayments = payments.map(p => ({
        id: p._id,
        paymentDate: p.createdAt,
        payerName: p.userId?.name,
        payerEmail: p.userId?.email,
        payerRole: p.userId?.role,
        providerName: p.providerId?.name,
        providerEmail: p.providerId?.email,
        totalAmount: p.amount / 100,
        platformFee: p.platformFee / 100,
        netAmount: (p.amount - p.platformFee) / 100,
        currency: p.currency,
        status: p.status,
        appointmentDate: p.appointmentId?.appointmentTime,
        serviceName: p.appointmentId?.serviceId?.name,
        paymentIntentId: p.stripePaymentIntentId,
        destinationAccountId: p.stripeDestinationAccountId,
    }));

    res.status(200).json({ success: true, count: formattedPayments.length, data: formattedPayments }); // Add pagination info later
});

// TODO: Add controller for initiating refunds (Admin/Provider role) 