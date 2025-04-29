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

// Define test users
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

// Function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connection established successfully.');

    // Seed roles
    console.log('Seeding roles...');
    // Delete existing roles
    await Role.deleteMany({});
    
    // Create new roles
    const createdRoles = await Role.insertMany(roles);
    console.log(`${createdRoles.length} roles created successfully.`);
    
    // Create a map of role names to their ObjectIds
    const roleMap = {};
    createdRoles.forEach(role => {
      roleMap[role.name] = role._id;
    });

    // Seed users
    console.log('Seeding test users...');
    // Delete existing test users by email
    const testEmails = testUsers.map(user => user.email);
    await User.deleteMany({ email: { $in: testEmails } });
    
    // Hash passwords and assign role IDs
    const saltRounds = 10;
    const userPromises = testUsers.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, saltRounds);
      return {
        name: user.name,
        email: user.email.toLowerCase(),
        password: hashedPassword,
        role: roleMap[user.role], // Assign the ObjectId of the role
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus
      };
    });
    
    const preparedUsers = await Promise.all(userPromises);
    const createdUsers = await User.insertMany(preparedUsers);
    console.log(`${createdUsers.length} test users created successfully.`);

    console.log('Database seeding completed successfully!');
    console.log('\nTest User Credentials:');
    testUsers.forEach(user => {
      console.log(`- ${user.role}: ${user.email} / ${user.password}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the seeding function
seedDatabase(); 