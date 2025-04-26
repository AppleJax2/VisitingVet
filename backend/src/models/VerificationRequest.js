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
}, { timestamps: true });

verificationRequestSchema.index({ user: 1, status: 1 });

const VerificationRequest = mongoose.model('VerificationRequest', verificationRequestSchema);

module.exports = VerificationRequest; 