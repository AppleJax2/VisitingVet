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

// Define the required roles
const requiredRoles = [
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
  },
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
  }
];

async function verifyAndFixRoles() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connection established successfully.');

    // Check all existing roles
    const existingRoles = await Role.find({});
    console.log(`Found ${existingRoles.length} roles in the database.`);

    // Map of roles by name for easy access
    const rolesByName = {};
    existingRoles.forEach(role => {
      rolesByName[role.name] = role;
    });

    // Ensure all required roles exist
    for (const requiredRole of requiredRoles) {
      const roleName = requiredRole.name;
      
      if (rolesByName[roleName]) {
        console.log(`Role ${roleName} exists - checking permissions...`);
        
        // Update permissions if needed
        const existingRole = rolesByName[roleName];
        const missingPermissions = requiredRole.permissions.filter(
          perm => !existingRole.permissions.includes(perm)
        );
        
        if (missingPermissions.length > 0) {
          console.log(`Updating ${roleName} with ${missingPermissions.length} missing permissions`);
          existingRole.permissions = [...new Set([...existingRole.permissions, ...missingPermissions])];
          await existingRole.save();
          console.log(`Role ${roleName} updated.`);
        } else {
          console.log(`Role ${roleName} has all required permissions.`);
        }
      } else {
        console.log(`Creating missing role: ${roleName}`);
        const newRole = await Role.create(requiredRole);
        console.log(`Role ${roleName} created with ID: ${newRole._id}`);
        
        // Add to our map
        rolesByName[roleName] = newRole;
      }
    }

    // Verify that at least one role is set as default
    const defaultRoles = await Role.find({ isDefault: true });
    if (defaultRoles.length === 0) {
      console.log('No default role found - setting PetOwner as default');
      
      const petOwnerRole = rolesByName['PetOwner'] || 
                         await Role.findOne({ name: 'PetOwner' });
      
      if (petOwnerRole) {
        petOwnerRole.isDefault = true;
        await petOwnerRole.save();
        console.log('PetOwner role set as default.');
      } else {
        console.log('Error: PetOwner role not found to set as default.');
      }
    } else if (defaultRoles.length > 1) {
      console.log(`Warning: ${defaultRoles.length} roles are set as default.`);
    } else {
      console.log(`Default role is: ${defaultRoles[0].name}`);
    }

    // Check users with invalid roles
    console.log('\nChecking for users with invalid roles...');
    const validRoleIds = Object.values(rolesByName).map(role => role._id.toString());
    
    const usersWithInvalidRoles = await User.find({
      role: { $exists: true },
      $expr: { 
        $not: { 
          $in: [
            { $toString: "$role" }, 
            validRoleIds
          ] 
        } 
      }
    });
    
    if (usersWithInvalidRoles.length > 0) {
      console.log(`Found ${usersWithInvalidRoles.length} users with invalid roles.`);
      
      // Find the default role
      const defaultRole = await Role.findOne({ isDefault: true });
      
      if (!defaultRole) {
        console.log('Error: Cannot fix users with invalid roles - no default role found.');
      } else {
        // Fix users with invalid roles
        for (const user of usersWithInvalidRoles) {
          console.log(`Fixing role for user ${user.email} (${user._id})`);
          user.role = defaultRole._id;
          await user.save();
        }
        console.log(`Fixed ${usersWithInvalidRoles.length} users with invalid roles.`);
      }
    } else {
      console.log('No users with invalid roles found.');
    }

    // Final status report
    console.log('\nRole verification and fixes completed.');
    console.log('Available roles:');
    const finalRoles = await Role.find({});
    console.table(finalRoles.map(role => ({
      name: role.name,
      permissions: role.permissions.length,
      isDefault: role.isDefault,
      _id: role._id.toString()
    })));

  } catch (error) {
    console.error('Error verifying roles:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

// Run the function
verifyAndFixRoles(); 