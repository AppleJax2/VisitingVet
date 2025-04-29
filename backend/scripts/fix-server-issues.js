/**
 * This script fixes two issues in the production deployment:
 * 1. UserActivityLog validation errors by cleaning up invalid log entries
 * 2. Ensuring the MVSProvider role exists in the database
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const UserActivityLog = require('../src/models/UserActivityLog');
const Role = require('../src/models/Role');

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

async function fixServerIssues() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connection established successfully.');

    // 1. Fix UserActivityLog issue by removing invalid entries
    console.log('Checking for invalid UserActivityLog entries...');
    const invalidLogCount = await UserActivityLog.countDocuments({ user: null });
    console.log(`Found ${invalidLogCount} invalid log entries (with null user field)`);
    
    if (invalidLogCount > 0) {
      console.log('Removing invalid UserActivityLog entries...');
      const deleteResult = await UserActivityLog.deleteMany({ user: null });
      console.log(`Removed ${deleteResult.deletedCount} invalid log entries`);
    }

    // 2. Check for MVSProvider role
    console.log('Checking for MVSProvider role...');
    const mvsProviderRole = await Role.findOne({ name: 'MVSProvider' });
    
    if (!mvsProviderRole) {
      console.log('MVSProvider role not found. Creating it...');
      
      const newRole = new Role({
        name: 'MVSProvider',
        description: 'Mobile Veterinary Service Provider',
        permissions: [
          'profile:read', 'profile:update',
          'services:create', 'services:read', 'services:update', 'services:delete',
          'availability:manage',
          'appointments:read', 'appointments:update', 'appointments:confirm', 'appointments:complete',
          'pets:read',
          'medical:create', 'medical:read', 'medical:update'
        ],
        isDefault: false
      });
      
      await newRole.save();
      console.log('MVSProvider role created successfully.');
    } else {
      console.log('MVSProvider role already exists.');
    }

    // List all roles for verification
    const allRoles = await Role.find({}).select('name');
    console.log('Current roles in the database:');
    console.log(allRoles.map(role => role.name).join(', '));

    console.log('\nFixes applied successfully!');

  } catch (error) {
    console.error('Error fixing server issues:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the fix function
fixServerIssues(); 