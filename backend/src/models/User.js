const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false, // Do not return password by default
  },
  role: {
    type: String,
    enum: ['PetOwner', 'MVSProvider', 'Clinic'], // Enforce specific roles
    required: [true, 'Please specify a user role'],
  },
  name: {
    type: String,
    trim: true,
  },
  phoneNumber: {
    type: String,
    trim: true,
    // We'll validate format in the frontend/controller
  },
  carrier: {
    type: String,
    enum: ['att', 'tmobile', 'verizon', 'sprint', 'boost', 'cricket', 'metro', 'uscellular', 'virgin', 'xfinity', 'other'],
    // Optional field - only required if user opts in for SMS
  },
  smsNotificationsEnabled: {
    type: Boolean,
    default: false,
  },
  emailNotificationsEnabled: {
    type: Boolean,
    default: true,
  },
  profileImage: {
    type: String,
    default: '/assets/default-profile.png',
  },

  // Admin & Verification Fields
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationStatus: {
    type: String,
    enum: ['NotSubmitted', 'Pending', 'Approved', 'Rejected'],
    default: 'NotSubmitted',
  },
  verificationDocuments: [{
    documentType: String, // e.g., 'License', 'Certification'
    fileUrl: String, // URL to the uploaded document (e.g., S3)
    submittedAt: Date,
  }],
  isBanned: {
    type: Boolean,
    default: false,
  },
  banReason: {
    type: String,
    default: '',
  },
  warningLevel: {
    type: Number,
    default: 0, // Represents number of warnings or severity level
  },

  // Stripe Customer ID
  stripeCustomerId: {
    type: String,
    unique: true, // Each user should have a unique Stripe customer ID
    sparse: true, // Allow null/undefined values without enforcing uniqueness
  },

  // Refresh token for JWT rotation
  refreshToken: {
    type: String,
    select: false, // Never return by default
  },

  // Admin session management fields
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  sessionTimeoutMinutes: {
    type: Number,
    default: 30, // Default timeout of 30 minutes for regular users
  },
  isAdmin: {
    type: Boolean,
    default: false, // Flag to identify admin users for special session handling
  },

  // Add other fields common to all users later if needed
  // Specific role details might be in separate linked collections or embedded
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Specify the collection name explicitly as 'users'
const User = mongoose.model('User', userSchema, 'users');

module.exports = User; 