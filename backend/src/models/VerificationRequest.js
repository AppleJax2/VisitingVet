const mongoose = require('mongoose');

const verificationRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Assuming one pending request per user at a time
  },
  submittedDocuments: [{
    documentType: {
      type: String,
      required: true, // e.g., 'VeterinaryLicense', 'BusinessLicense'
    },
    fileUrl: {
      type: String,
      required: true, // URL to the uploaded document (e.g., S3)
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  notes: {
    type: String, // Notes from user or admin
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who reviewed
  },
  reviewedAt: {
    type: Date,
  },
  completedAt: { // Timestamp when status moved to Approved/Rejected
    type: Date,
  },
  slaStatus: {
    type: String,
    enum: ['On Track', 'At Risk', 'Breached', 'Completed', 'N/A'],
    default: 'N/A', // Initially not applicable until processing starts? Or 'On Track'? TBD
  },
  slaProcessingTimeHours: { // Store calculated processing time
    type: Number,
  },
}, { timestamps: true });

verificationRequestSchema.index({ user: 1, status: 1 });

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

module.exports = VerificationRequest; 