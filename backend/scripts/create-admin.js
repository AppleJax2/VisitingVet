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

// Admin role definition with full permissions
const adminRole = {
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
};

// Admin user data (CHANGE THIS FOR YOUR ADMIN)
const adminUser = {
  name: 'Admin User',
  email: 'admin@visitingvet.com',
  password: 'AdminPassword123!', // Will be hashed before saving
  isVerified: true,
  verificationStatus: 'Approved',
  emailNotificationsEnabled: true,
  sessionTimeoutMinutes: 15 // Shorter session for admin
};

async function createAdmin() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connection established successfully.');

    // Check if Admin role exists, create if it doesn't
    let adminRoleDoc = await Role.findOne({ name: 'Admin' });
    
    if (!adminRoleDoc) {
      console.log('Creating Admin role...');
      adminRoleDoc = await Role.create(adminRole);
      console.log('Admin role created successfully.');
    } else {
      console.log('Admin role already exists, updating permissions...');
      // Update the permissions to ensure they're complete
      adminRoleDoc.permissions = adminRole.permissions;
      await adminRoleDoc.save();
    }

    // Check if admin user exists
    let adminUserDoc = await User.findOne({ email: adminUser.email });
    
    if (!adminUserDoc) {
      console.log('Creating Admin user...');
      // Hash the password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(adminUser.password, salt);
      
      // Create the admin user
      adminUserDoc = await User.create({
        ...adminUser,
        password: hashedPassword,
        role: adminRoleDoc._id
      });
      
      console.log('Admin user created successfully.');
      console.log(`\nAdmin login credentials:\nEmail: ${adminUser.email}\nPassword: ${adminUser.password}`);
      console.log('\nIMPORTANT: Please change this password after first login!\n');
    } else {
      console.log('Admin user already exists.');
      console.log(`\nExisting admin email: ${adminUser.email}`);
      console.log('If you need to reset the password, use the "Forgot Password" feature or update it in the database.');
    }

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the function
createAdmin(); 