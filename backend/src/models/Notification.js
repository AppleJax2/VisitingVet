const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['appointment_request', 'appointment_update', 'appointment_reminder', 
           'system_message', 'profile_update', 'payment'],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel',
  },
  referenceModel: {
    type: String,
    enum: ['Appointment', 'User', 'VisitingVetProfile', 'Service'],
  },
  actionUrl: {
    type: String,
  },
  sentViaEmail: {
    type: Boolean,
    default: false,
  },
  sentViaSms: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

// Add indexing for efficient queries
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 