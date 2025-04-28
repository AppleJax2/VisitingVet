const mongoose = require('mongoose');

const documentAccessLogSchema = new mongoose.Schema({
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  targetUser: { // The user whose document was accessed
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  documentKey: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  documentType: { // Store type if available (e.g., from VerificationRequest)
      type: String,
      required: false,
      trim: true,
  },
  action: {
    type: String,
    enum: ['VIEW', 'DOWNLOAD'], // Currently only VIEW/DOWNLOAD via signed URL
    default: 'VIEW',
    required: true,
  },
  ipAddress: {
    type: String,
    required: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Optional: TTL index to automatically delete old logs
// documentAccessLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

const DocumentAccessLog = mongoose.model('DocumentAccessLog', documentAccessLogSchema);

module.exports = DocumentAccessLog; 