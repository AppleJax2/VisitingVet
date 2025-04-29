// This script checks whether all required roles exist in the database
// and creates them if missing. Unlike seed.js, this script 
// doesn't delete existing data and only adds what's missing.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const Role = require('../src/models/Role');
const User = require('../src/models/User');

// MongoDB Connection URI
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
  process.exit(1);
}

// Define roles with permissions
const roles = [
  {
    name: 'Admin',
    description: 'Full administrative access',
    permissions: [
      'users:create', 'users:read', 'users:update', 'users:delete', 'users:verify', 'users:bulk_manage', 'users:read_activity',
      'profile:manage',
      'verifications:read', 'verifications:manage', 'verifications:read_history', 'verifications:read_metrics',
      'logs:read',
      'admin:full_access'
    ],
    isDefault: false
  },
  {
    name: 'PetOwner',
    description: 'Standard pet owner user',
    permissions: [
      'profile:read', 'profile:update',
      'pets:create', 'pets:read', 'pets:update', 'pets:delete',
      'appointments:create', 'appointments:read', 'appointments:update', 'appointments:cancel',
      'providers:read', 'reviews:create'
    ],
    isDefault: true
  },
  {
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
  },
  {
    name: 'Clinic',
    description: 'Veterinary Clinic',
    permissions: [
      'profile:read', 'profile:update',
      'services:create', 'services:read', 'services:update', 'services:delete',
      'availability:manage',
      'appointments:read', 'appointments:update', 'appointments:confirm', 'appointments:complete',
      'pets:read',
      'staff:manage',
      'medical:create', 'medical:read', 'medical:update'
    ],
    isDefault: false
  }
];

// Define test users - only created if they don't exist
const testUsers = [
  {
    name: 'Admin User',
    email: 'admin@visitingvet.com',
    password: 'Password123!', // Will be hashed in the script
    role: 'Admin',
    isVerified: true,
    verificationStatus: 'Approved'
  },
  {
    name: 'Pet Owner',
    email: 'petowner@example.com',
    password: 'Password123!',
    role: 'PetOwner',
    isVerified: true,
    verificationStatus: 'Approved'
  },
  {
    name: 'Mobile Vet',
    email: 'provider@example.com',
    password: 'Password123!',
    role: 'MVSProvider',
    isVerified: true,
    verificationStatus: 'Approved'
  },
  {
    name: 'Vet Clinic',
    email: 'clinic@example.com',
    password: 'Password123!',
    role: 'Clinic',
    isVerified: true,
    verificationStatus: 'Approved'
  }
];

// Function to safely initialize the database
async function initializeDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connection established successfully.');

    // Check and seed roles
    console.log('Checking roles...');
    const roleMap = {};
    const existingRoleNames = new Set();
    
    // Find existing roles
    const existingRoles = await Role.find({});
    existingRoles.forEach(role => {
      existingRoleNames.add(role.name);
      roleMap[role.name] = role._id;
    });
    
    console.log('Existing roles:', Array.from(existingRoleNames));
    
    // Create missing roles
    const missingRoles = roles.filter(role => !existingRoleNames.has(role.name));
    if (missingRoles.length > 0) {
      console.log(`Creating ${missingRoles.length} missing roles:`, missingRoles.map(r => r.name));
      const createdRoles = await Role.insertMany(missingRoles);
      console.log(`${createdRoles.length} roles created successfully.`);
      
      // Update roleMap with newly created roles
      createdRoles.forEach(role => {
        roleMap[role.name] = role._id;
      });
    } else {
      console.log('All required roles already exist.');
    }

    // Check and seed test users
    console.log('Checking test users...');
    const createdUsers = [];
    
    for (const user of testUsers) {
      const existingUser = await User.findOne({ email: user.email.toLowerCase() });
      
      if (!existingUser) {
        console.log(`Creating test user: ${user.email}`);
        
        // Make sure the role exists
        if (!roleMap[user.role]) {
          console.error(`Error: Role '${user.role}' not found for user ${user.email}`);
          continue;
        }
        
        const hashedPassword = await bcrypt.hash(user.password, 10);
        const newUser = new User({
          name: user.name,
          email: user.email.toLowerCase(),
          password: hashedPassword,
          role: roleMap[user.role], // Assign the ObjectId of the role
          isVerified: user.isVerified,
          verificationStatus: user.verificationStatus
        });
        
        await newUser.save();
        createdUsers.push(user);
      } else {
        console.log(`User ${user.email} already exists.`);
      }
    }

    if (createdUsers.length > 0) {
      console.log(`${createdUsers.length} test users created successfully.`);
      console.log('\nTest User Credentials:');
      createdUsers.forEach(user => {
        console.log(`- ${user.role}: ${user.email} / ${user.password}`);
      });
    } else {
      console.log('No new test users needed to be created.');
    }

    console.log('\nDatabase initialization completed successfully!');

  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the initialization function
initializeDatabase(); 