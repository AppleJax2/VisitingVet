const mongoose = require('mongoose');
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

async function checkRoles() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connection established successfully.');

    // Find all roles
    const roles = await Role.find({});
    console.log('Current roles in database:');
    console.table(roles.map(role => ({
      name: role.name,
      description: role.description,
      permissions: role.permissions.length,
      isDefault: role.isDefault,
      _id: role._id.toString()
    })));

    // Find users grouped by role
    console.log('\nUsers by role:');
    const userCounts = await User.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleInfo'
        }
      },
      {
        $unwind: '$roleInfo'
      },
      {
        $group: {
          _id: '$roleInfo.name',
          count: { $sum: 1 }
        }
      }
    ]);
    
    console.table(userCounts.map(item => ({
      role: item._id,
      userCount: item.count
    })));

  } catch (error) {
    console.error('Error checking roles:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the function
checkRoles(); 