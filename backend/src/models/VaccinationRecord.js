const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const VerificationStatus = Object.freeze({
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
});

const vaccinationRecordSchema = new Schema({
  pet: {
    type: Schema.Types.ObjectId,
    ref: 'Pet',
    required: true,
    index: true,
  },
  vaccineType: {
    type: String,
    required: true,
    trim: true,
  },
  administrationDate: {
    type: Date,
    required: true,
  },
  expirationDate: {
    type: Date,
  },
  verifier: { // Reference to the Admin/Vet user who verified the record
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationStatus: {
    type: String,
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.PENDING,
    required: true,
    index: true,
  },
  originalRecordUrl: { // URL to the stored document (e.g., S3)
    type: String,
    trim: true,
  },
  ocrProcessedText: { // Text extracted via OCR
    type: String,
    trim: true,
  },
  rejectionReason: { // Reason if status is 'rejected'
      type: String,
      trim: true,
  },
  verifiedAt: { // Timestamp when verification status last changed
      type: Date,
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Ensure compound index for efficient querying by pet and status
vaccinationRecordSchema.index({ pet: 1, verificationStatus: 1 });

// Static method to get valid verification statuses
vaccinationRecordSchema.statics.getVerificationStatuses = function() {
  return Object.values(VerificationStatus);
};

const VaccinationRecord = mongoose.model('VaccinationRecord', vaccinationRecordSchema);

module.exports = { VaccinationRecord, VerificationStatus }; 