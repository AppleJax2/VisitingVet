const mongoose = require('mongoose');

const adminActionLogSchema = new mongoose.Schema({
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String,
    enum: ['VerifyUser', 'RejectVerification', 'BanUser', 'UnbanUser', 'IssueWarning', 'ReviewContent', 'DeleteContent'],
    required: true,
  },
  reason: {
    type: String,
  },
  details: {
    // Store additional context like warning level, reviewed content ID, etc.
    type: mongoose.Schema.Types.Mixed,
  },
}, { timestamps: true });

adminActionLogSchema.index({ adminUser: 1 });
adminActionLogSchema.index({ targetUser: 1 });
adminActionLogSchema.index({ actionType: 1 });

const AdminActionLog = mongoose.model('AdminActionLog', adminActionLogSchema);

module.exports = AdminActionLog; 