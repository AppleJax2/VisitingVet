const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Role name is required'],
    unique: true,
    trim: true,
    // Example roles: 'Admin', 'SupportLevel1', 'PetOwner', 'MVSProvider', 'ClinicManager'
  },
  description: {
    type: String,
    trim: true,
  },
  permissions: {
    type: [String], // Array of permission strings, e.g., ['users:read', 'users:update']
    required: true,
    default: [],
    // Example permissions:
    // users:create, users:read, users:update, users:delete, users:manage_roles
    // verifications:read, verifications:approve, verifications:reject
    // settings:manage, analytics:read, payments:read, payments:refund
    // admin:full_access (Super admin)
  },
  isDefault: {
    type: Boolean,
    default: false, // Indicate if this is a default role assigned on registration
  }
}, { timestamps: true });

const Role = mongoose.model('Role', roleSchema);

module.exports = Role; 