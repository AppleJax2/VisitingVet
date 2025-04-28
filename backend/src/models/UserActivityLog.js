const mongoose = require('mongoose');

const userActivityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true, // Index for faster querying by user
  },
  ipAddress: {
    type: String,
    required: false, // May not always be available or relevant
  },
  action: {
    type: String,
    required: true,
    trim: true,
    index: true,
    // Examples: LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT, REGISTER_SUCCESS, 
    //           PROFILE_UPDATE, PET_CREATE, PET_UPDATE, PET_DELETE, 
    //           APPOINTMENT_CREATE, APPOINTMENT_UPDATE, APPOINTMENT_CANCEL,
    //           SERVICE_REQUEST_CREATE, SERVICE_REQUEST_UPDATE, PAYMENT_INITIATED,
    //           PAYMENT_SUCCESS, PAYMENT_FAILURE, VET_PROFILE_UPDATE, 
    //           AVAILABILITY_UPDATE, PASSWORD_RESET_REQUEST, PASSWORD_RESET_SUCCESS
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE'],
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Store arbitrary context data
    // e.g., { petId: '...', appointmentId: '...', fieldsUpdated: ['name', 'email'] }
  },
  errorMessage: {
    type: String,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true, // Index for sorting/querying by time
  },
});

// Optional: TTL index to automatically delete old logs after a certain period
// userActivityLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 }); // e.g., delete logs older than 1 year

const UserActivityLog = mongoose.model('UserActivityLog', userActivityLogSchema);

module.exports = UserActivityLog; 