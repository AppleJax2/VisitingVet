const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  petOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pet owner is required'],
  },
  providerProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisitingVetProfile',
    required: [true, 'Provider profile is required'],
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Service is required'],
  },
  appointmentTime: {
    type: Date,
    required: [true, 'Appointment time is required'],
  },
  estimatedEndTime: {
    type: Date,
    required: [true, 'Estimated end time is required'],
  },
  status: {
    type: String,
    enum: ['Requested', 'Confirmed', 'Cancelled', 'Completed', 'CancelledByOwner'],
    default: 'Requested',
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
  // New fields for enhanced appointment management
  location: {
    type: String,
    trim: true,
  },
  animalDetails: {
    name: String,
    type: String,
    breed: String,
    age: Number,
    weight: Number,
    specialNeeds: String,
  },
  // Track cancellation reasons and details
  cancellationReason: {
    type: String,
    maxlength: [500, 'Cancellation reason cannot be more than 500 characters'],
  },
  cancelledBy: {
    type: String,
    enum: ['Provider', 'PetOwner', 'System'],
  },
  cancellationTime: {
    type: Date,
  },
  // Completion details
  completionNotes: {
    type: String,
    maxlength: [1000, 'Completion notes cannot be more than 1000 characters'],
  },
  followUpRecommended: {
    type: Boolean,
    default: false,
  },
  followUpNotes: {
    type: String,
    maxlength: [500, 'Follow-up notes cannot be more than 500 characters'],
  },
  // Custom fields submitted by the pet owner (from Service customFields)
  customFieldResponses: [{
    fieldName: String,
    response: mongoose.Schema.Types.Mixed,
  }],
  // Notification tracking
  notifications: [{
    type: {
      type: String,
      enum: ['Created', 'Updated', 'Reminder', 'Cancelled', 'Completed'],
      required: true,
    },
    sentTo: {
      type: String,
      enum: ['Provider', 'PetOwner', 'Both'],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    channel: {
      type: String,
      enum: ['Email', 'SMS', 'InApp'],
      required: true,
    },
    successful: {
      type: Boolean,
      default: true,
    },
    errorMessage: String,
  }],
}, { timestamps: true });

// Add indexing for efficient queries
appointmentSchema.index({ petOwner: 1, status: 1 });
appointmentSchema.index({ providerProfile: 1, status: 1 });
appointmentSchema.index({ appointmentTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 