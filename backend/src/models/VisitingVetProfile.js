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