const express = require('express');
const {
    submitReview,
    getProviderReviews,
    getMyReviews,
    getPendingReviews,
    moderateReview,
    respondToReview,
    updateReview,
    deleteReview
} = require('../controllers/reviewController');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

// --- Public Routes ---
// Get approved reviews for a provider
router.get('/provider/:providerProfileId', getProviderReviews);

// --- PetOwner Routes ---
// Submit a new review
router.post('/', protect, authorize(ROLES.PetOwner), submitReview);
// Get reviews submitted by the logged-in user
router.get('/my-reviews', protect, authorize(ROLES.PetOwner), getMyReviews);
// Update own review
router.put('/:reviewId', protect, authorize(ROLES.PetOwner), updateReview);
// Delete own review (also allowed for Admin)
router.delete('/:reviewId', protect, authorize(ROLES.PetOwner, ROLES.Admin), deleteReview);

// --- Provider Routes ---
// Respond to a review
router.post('/:reviewId/respond', protect, authorize(ROLES.MVSProvider), respondToReview);

// --- Admin Routes ---
// Get reviews pending moderation
router.get('/pending', protect, authorize(ROLES.Admin), getPendingReviews);
// Moderate a review (Approve/Reject)
router.put('/:reviewId/moderate', protect, authorize(ROLES.Admin), moderateReview);
// Admin can also delete reviews via the DELETE /:reviewId route

module.exports = router; 