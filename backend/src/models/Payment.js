const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  providerId: { // User ID of the provider receiving the funds
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    index: true,
  },
  amount: {
    type: Number, // Store amount in cents
    required: true,
  },
  platformFee: { // Store platform fee in cents
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'usd',
    index: true,
  },
  status: {
    type: String,
    enum: ['pending', 'succeeded', 'failed', 'requires_action', 'canceled', 'refunded'],
    required: true,
    default: 'pending',
    index: true,
  },
  stripePaymentIntentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  stripeDestinationAccountId: { // Stripe Connect account ID of the provider
    type: String,
    required: true,
    index: true,
  },
  stripeCustomerId: {
    type: String, // Store Stripe Customer ID for easier lookups
    index: true,
  },
  paymentMethodDetails: {
    // Store basic details like card brand and last 4 digits
    type: Object,
  },
  refundedAmount: {
    type: Number, // Store refunded amount in cents
    default: 0,
  },
}, { timestamps: true });

// Specify the collection name explicitly as 'payments'
const Payment = mongoose.model('Payment', paymentSchema, 'payments');

module.exports = Payment; 