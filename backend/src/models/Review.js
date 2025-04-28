const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5'],
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review comment cannot exceed 1000 characters'],
    required: [true, 'Please provide a comment for your review'],
  },
  reviewer: { // Pet Owner who wrote the review
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  providerProfile: { // The profile being reviewed
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitingVetProfile',
    required: true,
    index: true,
  },
  appointment: { // Link review to a specific completed appointment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true,
    unique: true, // Only one review per appointment
    index: true,
  },
  moderationStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
    index: true,
  },
  moderatorNotes: {
    type: String,
    trim: true,
    maxlength: [500, 'Moderator notes cannot exceed 500 characters'],
  },
  providerResponse: {
    comment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Provider response cannot exceed 1000 characters'],
    },
    responseDate: {
        type: Date,
    }
  }
}, { timestamps: true });

// Prevent user from submitting more than one review per appointment (redundant due to unique index but good practice)
reviewSchema.index({ appointment: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ providerProfile: 1, moderationStatus: 1 }); // For fetching approved reviews

// Static method to calculate average rating for a provider profile
reviewSchema.statics.calculateAverageRating = async function(providerProfileId) {
    const stats = await this.aggregate([
        {
            $match: { providerProfile: providerProfileId, moderationStatus: 'Approved' }
        },
        {
            $group: {
                _id: '$providerProfile',
                averageRating: { $avg: '$rating' },
                numberOfReviews: { $sum: 1 }
            }
        }
    ]);

    try {
        const profileModel = mongoose.model('VisitingVetProfile');
        if (stats.length > 0) {
             await profileModel.findByIdAndUpdate(providerProfileId, {
                averageRating: stats[0].averageRating.toFixed(1), // Store with one decimal place
                numberOfReviews: stats[0].numberOfReviews
            });
            console.log(`Updated average rating for profile ${providerProfileId}: ${stats[0].averageRating.toFixed(1)} (${stats[0].numberOfReviews} reviews)`);
        } else {
            // No approved reviews found, reset rating
             await profileModel.findByIdAndUpdate(providerProfileId, {
                averageRating: 0,
                numberOfReviews: 0
            });
             console.log(`Reset average rating for profile ${providerProfileId} (no approved reviews)`);
        }
    } catch (err) {
        console.error(`Error updating average rating for profile ${providerProfileId}:`, err);
    }
};

// Call calculateAverageRating after save (for new reviews)
reviewSchema.post('save', async function() {
    // Check if status is approved before calculating
    if (this.moderationStatus === 'Approved') {
        await this.constructor.calculateAverageRating(this.providerProfile);
    }
});

// Call calculateAverageRating after findOneAndRemove, findOneAndUpdate (if status changes)
// Using pre hook to get access to the document being removed/updated
reviewSchema.pre(/^findOneAnd/, async function(next) {
    // Store the document to access it in the post hook
    // Only store if the query might affect approved reviews
    const update = this.getUpdate();
    if (update && update.moderationStatus && update.moderationStatus !== 'Approved') {
        // If status is changing FROM Approved TO something else
        this._docPreUpdate = await this.model.findOne(this.getQuery()).lean();
    } else if (update && update.moderationStatus === 'Approved') {
         // If status is changing TO Approved (will be handled by post save on the update)
         // But we still need the ID for potential deletions
         this._docPreUpdate = await this.model.findOne(this.getQuery()).lean();
    } else if (this.op === 'findOneAndRemove') {
         this._docPreUpdate = await this.model.findOne(this.getQuery()).lean();
    }
    next();
});

reviewSchema.post(/^findOneAnd/, async function() {
     // Check if a document was stored in the pre hook
    if (this._docPreUpdate && this._docPreUpdate.providerProfile) {
        // Need to recalculate rating for the provider profile
        await this.model.calculateAverageRating(this._docPreUpdate.providerProfile);
    }
    // We might need to call calculateAverageRating again if the status was updated TO 'Approved'
    // because the 'save' hook doesn't run for findOneAndUpdate
    const update = this.getUpdate();
    if (update && update.moderationStatus === 'Approved') {
        const updatedDoc = await this.model.findOne(this.getQuery()).lean();
        if (updatedDoc && updatedDoc.providerProfile) {
             await this.model.calculateAverageRating(updatedDoc.providerProfile);
        }
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; 