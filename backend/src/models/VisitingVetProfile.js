const mongoose = require('mongoose');

const visitingVetProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One profile per user
  },
  bio: {
    type: String,
    required: [true, 'Please provide a professional bio'],
    maxlength: [1000, 'Bio cannot be more than 1000 characters'],
  },
  credentials: {
    type: [String],
    default: [],
  },
  yearsExperience: {
    type: Number,
    min: [0, 'Years of experience must be a positive number'],
  },
  photoUrl: {
    type: String,
    // Will add validation for URL format if needed
  },
  serviceAreaDescription: {
    type: String,
    maxlength: [500, 'Service area description cannot be more than 500 characters'],
  },
  serviceAreaRadiusKm: {
    type: Number,
    min: [0, 'Service area radius must be a positive number'],
  },
  serviceAreaZipCodes: {
    type: [String],
    default: [],
  },
  licenseInfo: {
    type: String,
    required: [true, 'Please provide license information'],
  },
  insuranceInfo: {
    type: String,
    required: [true, 'Please provide insurance information'],
  },
  clinicAffiliations: {
    type: [String],
    default: [],
  },
  // New fields for external scheduling
  useExternalScheduling: {
    type: Boolean,
    default: false,
    required: true,
  },
  externalSchedulingUrl: {
    type: String,
    validate: {
      validator: function(v) {
        // Only required if useExternalScheduling is true
        return !this.useExternalScheduling || (v && v.trim().length > 0);
      },
      message: 'External scheduling URL is required when using external scheduling'
    }
  },
  contactPhone: {
    type: String,
    trim: true,
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
  // Business information
  businessName: {
    type: String,
    trim: true,
  },
  businessAddress: {
    type: String,
    trim: true,
  },
  businessDescription: {
    type: String,
    maxlength: [1000, 'Business description cannot be more than 1000 characters'],
  },
  // Animal type specialization
  animalTypes: {
    type: [{
      type: String,
      enum: ['Small Animal', 'Large Animal', 'Exotic', 'Avian', 'Equine', 'Farm Animal', 'Other'],
    }],
    default: ['Small Animal'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one animal type must be selected'
    }
  },
  // Ferrier or other specialty service type
  specialtyServices: {
    type: [String],
    default: [],
  },

  // Rating Information (calculated from Reviews)
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numberOfReviews: {
    type: Number,
    default: 0
  },

  // Stripe Connect Information
  stripeAccountId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined, unique only when set
  },
  stripeAccountStatus: {
    type: String,
    enum: ['onboarding_incomplete', 'pending_verification', 'verified', 'restricted', 'disabled'],
    default: 'onboarding_incomplete',
  },
  stripeChargesEnabled: {
    type: Boolean,
    default: false, // Indicates if payouts can be made
  },
  stripePayoutsEnabled: {
    type: Boolean,
    default: false, // Indicates if payouts can be sent from Stripe
  },

}, { timestamps: true });

// Virtual for fetching services
visitingVetProfileSchema.virtual('services', {
  ref: 'Service',
  localField: '_id',
  foreignField: 'profile',
  justOne: false, // Set to true if it's a one-to-one relationship
});

// Always populate virtuals when using find, findOne, etc.
visitingVetProfileSchema.set('toJSON', { virtuals: true });
visitingVetProfileSchema.set('toObject', { virtuals: true });

const VisitingVetProfile = mongoose.model('VisitingVetProfile', visitingVetProfileSchema);

module.exports = VisitingVetProfile; 