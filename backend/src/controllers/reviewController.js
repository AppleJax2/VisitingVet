const asyncHandler = require('../middleware/asyncHandler');
const Review = require('../models/Review');
const Appointment = require('../models/Appointment');
const VisitingVetProfile = require('../models/VisitingVetProfile');
const ErrorResponse = require('../utils/errorResponse');
const { ROLES } = require('../config/constants');

/**
 * @desc    Submit a new review for a completed appointment
 * @route   POST /api/v1/reviews
 * @access  Private (PetOwner)
 */
exports.submitReview = asyncHandler(async (req, res, next) => {
    const { appointmentId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!appointmentId || !rating || !comment) {
        return next(new ErrorResponse('Missing required fields: appointmentId, rating, comment', 400));
    }

    // 1. Validate Appointment
    const appointment = await Appointment.findById(appointmentId)
                                        .populate('providerProfileId'); // Populate to get provider profile ID

    if (!appointment) {
        return next(new ErrorResponse(`Appointment not found with ID ${appointmentId}`, 404));
    }

    // 2. Check Authorization & Appointment Status
    if (appointment.petOwnerId.toString() !== reviewerId) {
        return next(new ErrorResponse('You can only review appointments you were the pet owner for', 403));
    }
    if (appointment.status !== 'Completed') {
        return next(new ErrorResponse('You can only review completed appointments', 400));
    }
    if (!appointment.providerProfileId?._id) {
         return next(new ErrorResponse('Provider information missing for this appointment', 500));
    }

    // 3. Check if already reviewed (should also be caught by unique index, but good practice)
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
        return next(new ErrorResponse('This appointment has already been reviewed', 400));
    }

    // 4. Create Review
    const review = await Review.create({
        rating,
        comment,
        reviewer: reviewerId,
        providerProfile: appointment.providerProfileId._id,
        appointment: appointmentId,
        moderationStatus: 'Pending' // Start as pending moderation
    });

    // Note: Average rating calculation is handled by the post-save hook in the Review model
    // only when moderationStatus becomes 'Approved'.

    res.status(201).json({ success: true, data: review });
});

/**
 * @desc    Get all APPROVED reviews for a specific provider profile
 * @route   GET /api/v1/reviews/provider/:providerProfileId
 * @access  Public
 */
exports.getProviderReviews = asyncHandler(async (req, res, next) => {
    const providerProfileId = req.params.providerProfileId;

    // Validate profile exists (optional, but good practice)
    const profileExists = await VisitingVetProfile.findById(providerProfileId).select('_id');
    if (!profileExists) {
        return next(new ErrorResponse(`Provider profile not found with ID ${providerProfileId}`, 404));
    }

    // Find approved reviews, populate reviewer name
    const reviews = await Review.find({ 
        providerProfile: providerProfileId, 
        moderationStatus: 'Approved' 
    })
    .populate('reviewer', 'name profileImage') // Populate reviewer's name and image
    .sort({ createdAt: -1 }); // Show newest first

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

/**
 * @desc    Get reviews submitted by the logged-in user
 * @route   GET /api/v1/reviews/my-reviews
 * @access  Private (PetOwner)
 */
exports.getMyReviews = asyncHandler(async (req, res, next) => {
    const reviewerId = req.user.id;

    const reviews = await Review.find({ reviewer: reviewerId })
        .populate({
            path: 'providerProfile',
            select: 'businessName user',
            populate: {
                path: 'user',
                select: 'name'
            }
        })
        .populate({
            path: 'appointment',
            select: 'appointmentTime serviceId',
             populate: {
                path: 'serviceId',
                select: 'name'
            }
        })
        .sort({ createdAt: -1 });

    // Optionally format data
    const formatted = reviews.map(r => ({
        id: r._id,
        rating: r.rating,
        comment: r.comment,
        date: r.createdAt,
        providerName: r.providerProfile?.businessName || r.providerProfile?.user?.name || 'N/A',
        serviceName: r.appointment?.serviceId?.name || 'N/A',
        appointmentDate: r.appointment?.appointmentTime,
        status: r.moderationStatus,
        providerResponse: r.providerResponse
    }));

    res.status(200).json({ success: true, count: formatted.length, data: formatted });
});


/**
 * @desc    Get reviews pending moderation
 * @route   GET /api/v1/reviews/pending
 * @access  Private (Admin)
 */
exports.getPendingReviews = asyncHandler(async (req, res, next) => {
    // TODO: Add pagination
    const reviews = await Review.find({ moderationStatus: 'Pending' })
        .populate('reviewer', 'name email')
        .populate({
            path: 'providerProfile',
            select: 'businessName user',
            populate: { path: 'user', select: 'name email' }
        })
        .populate({
            path: 'appointment',
            select: 'appointmentTime serviceId',
             populate: { path: 'serviceId', select: 'name price' }
        })
        .sort({ createdAt: 1 }); // Show oldest first for moderation queue

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
});

/**
 * @desc    Moderate a review (Approve/Reject)
 * @route   PUT /api/v1/reviews/:reviewId/moderate
 * @access  Private (Admin)
 */
exports.moderateReview = asyncHandler(async (req, res, next) => {
    const { reviewId } = req.params;
    const { status, moderatorNotes } = req.body; // status should be 'Approved' or 'Rejected'

    if (!['Approved', 'Rejected'].includes(status)) {
        return next(new ErrorResponse('Invalid moderation status. Must be Approved or Rejected.', 400));
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new ErrorResponse(`Review not found with ID ${reviewId}`, 404));
    }

    // Allow re-moderation if needed, but usually done on Pending reviews
    // if (review.moderationStatus !== 'Pending') {
    //     return next(new ErrorResponse(`Review ${reviewId} is not pending moderation.`, 400));
    // }

    review.moderationStatus = status;
    review.moderatorNotes = moderatorNotes || '';
    
    await review.save(); // This will trigger the post-save hook if status becomes 'Approved'
    
    // If status changes *from* Approved to Rejected, the pre/post findOneAnd hooks handle rating update.
    // If status changes *to* Approved, the post save hook handles rating update.
    // Manually trigger recalculation if changing away from Approved via save? No, hooks should cover it.
    // Let's ensure the post save hook re-calculates even if status was already approved (idempotency).
    // Modify Review Model: post('save') hook should call calculateAverageRating(this.providerProfile) regardless of previous status IF current status is 'Approved'.
    // OR rely on the findOneAndUpdate hook logic which we are NOT using here (using findById then save). Save hook is fine.
    
    // If status was changed FROM Approved to Rejected, we need to trigger recalc here manually
    // because the save hook only triggers *if* status becomes Approved.
    // The pre/post findOneAndUpdate hooks don't apply here. Let's add manual recalc if rejected.
    if (status === 'Rejected') {
         await Review.calculateAverageRating(review.providerProfile);
    }

    res.status(200).json({ success: true, data: review });
});

/**
 * @desc    Provider responds to a review
 * @route   POST /api/v1/reviews/:reviewId/respond
 * @access  Private (MVSProvider)
 */
exports.respondToReview = asyncHandler(async (req, res, next) => {
    const { reviewId } = req.params;
    const { responseComment } = req.body;
    const providerUserId = req.user.id;

    if (!responseComment) {
        return next(new ErrorResponse('Response comment is required', 400));
    }

    const review = await Review.findById(reviewId).populate('providerProfile');

    if (!review) {
        return next(new ErrorResponse(`Review not found with ID ${reviewId}`, 404));
    }

    // Check if logged-in provider owns the profile being reviewed
    if (review.providerProfile.user.toString() !== providerUserId) {
        return next(new ErrorResponse('You are not authorized to respond to this review', 403));
    }

    // Allow response only to Approved reviews?
    if (review.moderationStatus !== 'Approved') {
         return next(new ErrorResponse('Cannot respond to reviews that are not approved', 400));
    }

    // Prevent overwriting existing response? Or allow edits?
    // if (review.providerResponse && review.providerResponse.comment) {
    //     return next(new ErrorResponse('A response has already been submitted for this review', 400));
    // }

    review.providerResponse = {
        comment: responseComment,
        responseDate: new Date()
    };

    await review.save();

    res.status(200).json({ success: true, data: review });
});

/**
 * @desc    Update own review
 * @route   PUT /api/v1/reviews/:reviewId
 * @access  Private (PetOwner)
 */
exports.updateReview = asyncHandler(async (req, res, next) => {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!rating && !comment) {
         return next(new ErrorResponse('Please provide rating or comment to update', 400));
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new ErrorResponse(`Review not found with ID ${reviewId}`, 404));
    }

    // Check ownership
    if (review.reviewer.toString() !== reviewerId) {
        return next(new ErrorResponse('You are not authorized to update this review', 403));
    }

    // Allow edits only within a certain timeframe? Or if pending?
    // For simplicity, allow edits anytime for now.

    if (rating) review.rating = rating;
    if (comment) review.comment = comment;
    
    // If an approved review is edited, should it go back to pending?
    // Let's assume edits on approved reviews remain approved for now.
    // review.moderationStatus = 'Pending'; // Optionally reset status

    await review.save(); // This will trigger rating recalc if it was/is approved.

    res.status(200).json({ success: true, data: review });
});


/**
 * @desc    Delete a review
 * @route   DELETE /api/v1/reviews/:reviewId
 * @access  Private (PetOwner or Admin)
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {
    const { reviewId } = req.params;
    const user = req.user;

    const review = await Review.findById(reviewId);

    if (!review) {
        return next(new ErrorResponse(`Review not found with ID ${reviewId}`, 404));
    }

    // Check ownership or admin role
    if (review.reviewer.toString() !== user.id && user.role !== ROLES.Admin) {
        return next(new ErrorResponse('You are not authorized to delete this review', 403));
    }
    
    const providerProfileId = review.providerProfile; // Store ID before removing

    await review.remove(); // Use remove() which triggers middleware

    // Manually trigger rating recalculation after removal? 
    // The model's pre/post findOneAnd hooks *should* catch findOneAndRemove, but let's be safe.
    // Note: remove() doesn't trigger findOneAnd hooks. findByIdAndDelete does.
    // Let's switch to findByIdAndDelete to ensure hooks run OR keep remove() and manually recalc.
    // Manual recalc is safer here.
    await Review.calculateAverageRating(providerProfileId);

    res.status(200).json({ success: true, data: {} });
}); 