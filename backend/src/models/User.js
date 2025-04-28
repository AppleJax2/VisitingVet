const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { validatePasswordStrength } = require('../validations/userValidation');
// const Role = require('./Role'); // Import Role model

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
    minlength: 8,
    select: false, // Do not return password by default
    validate: {
      validator: function(password) {
        // Only validate password when it's being modified
        if (!this.isModified('password')) return true;
        
        const validationResult = validatePasswordStrength(password);
        return validationResult.isValid;
      },
      message: props => {
        const validationResult = validatePasswordStrength(props.value);
        return validationResult.errors.join(', ');
      }
    }
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, 'User role must be assigned'],
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

  // MFA fields
  mfaEnabled: {
    type: Boolean,
    default: false,
  },
  mfaSecret: {
    type: String,
    select: false, // Never return by default
  },
  mfaBackupCodes: [{
    code: {
      type: String,
      select: false,
    },
    used: {
      type: Boolean,
      default: false,
    }
  }],
  mfaVerified: {
    type: Boolean,
    default: false, // Initially false until user completes setup
  },

  // Password Reset Fields
  passwordResetToken: {
    type: String,
    select: false, // Do not return in queries by default
  },
  passwordResetExpires: {
    type: Date,
    select: false, // Do not return in queries by default
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