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
    enum: ['Requested', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Requested',
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters'],
  },
}, { timestamps: true });

// Add indexing for efficient queries
appointmentSchema.index({ petOwner: 1, status: 1 });
appointmentSchema.index({ providerProfile: 1, status: 1 });
appointmentSchema.index({ appointmentTime: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment; 