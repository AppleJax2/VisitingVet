const mongoose = require('mongoose');

const serviceUsageLogSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [ // Define known event types for consistency
      'API_CALL',
      'APPOINTMENT_CREATED',
      'APPOINTMENT_UPDATED',
      'APPOINTMENT_CANCELLED',
      'VIDEO_SESSION_START',
      'VIDEO_SESSION_END',
      'CHAT_MESSAGE_SENT',
      'USER_LOGIN',
      'USER_REGISTER',
      'PET_CREATED',
      'PET_UPDATED',
      // Add more specific events as needed
      'OTHER' // Generic fallback
    ],
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null, // Allow null if action is not user-specific (e.g., system event)
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Flexible field for event-specific data
    default: {},
    /* Examples:
       For API_CALL: { method: 'GET', path: '/api/users', statusCode: 200, durationMs: 50 }
       For APPOINTMENT_CREATED: { appointmentId: '...', providerId: '...', ownerId: '...' }
       For VIDEO_SESSION_START: { sessionId: '...', participants: ['...', '...'] }
    */
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false, // Explicitly using 'timestamp' field
  collection: 'serviceusagelogs' // Optional: specify collection name
});

// Compound index for common queries (e.g., events by type and date)
serviceUsageLogSchema.index({ eventType: 1, timestamp: -1 });

const ServiceUsageLog = mongoose.model('ServiceUsageLog', serviceUsageLogSchema);

module.exports = ServiceUsageLog; 