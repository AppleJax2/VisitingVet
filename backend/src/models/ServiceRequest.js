const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceRequestSchema = new Schema({
  clinic: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pet: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  petOwner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedServices: [{
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service'
    },
    notes: String
  }],
  medicalNotes: {
    type: String,
    required: true
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'scheduled', 'completed', 'cancelled'],
    default: 'pending'
  },
  preferredDates: [{
    date: Date,
    timeSlot: String
  }],
  scheduledAppointment: {
    type: Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  providerResponse: {
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined']
    },
    message: String,
    respondedAt: Date,
    availableTimeSlots: [{
      date: Date,
      timeSlot: String
    }]
  },
  petOwnerResponse: {
    status: {
      type: String,
      enum: ['pending', 'selected', 'declined']
    },
    selectedTimeSlot: {
      date: Date,
      timeSlot: String
    },
    respondedAt: Date
  },
  resultNotes: {
    type: String
  },
  attachments: [{
    name: String,
    fileUrl: String,
    uploadedAt: Date,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
serviceRequestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema); 