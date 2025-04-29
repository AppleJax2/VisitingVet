const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role'); // Import Role model

// Update user's lastActivity timestamp
const updateLastActivity = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { lastActivity: Date.now() });
  } catch (error) {
    console.error('Failed to update last activity:', error);
    // Decide if this error should propagate or be logged only
  }
};

const protect = async (req, res, next) => {
  let token;

  // Check JWT token from cookie first
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } 
  // If not found in cookie, check Authorization header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Format: "Bearer token_value"
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch user AND populate their role with permissions
      const user = await User.findById(decoded.id).populate({ 
          path: 'role', 
          select: 'name permissions' // Select only name and permissions from Role
      }).select('-password -refreshToken'); // Exclude sensitive fields

      if (!user || !user.role) {
        return res.status(401).json({ message: 'Not authorized, user or role not found' });
      }
      
      req.user = user; // Assign the populated user object to req.user
      // req.user now contains user details and req.user.role = { name: 'Admin', permissions: [...] }

      // Check for session timeout
      const currentTime = new Date();
      const lastActivity = new Date(req.user.lastActivity);
      // Use a default timeout if not set on user (though role might dictate this later)
      const timeoutMinutes = req.user.sessionTimeoutMinutes || 30; 
      const minutesSinceLastActivity = Math.floor((currentTime - lastActivity) / (1000 * 60));

      if (minutesSinceLastActivity > timeoutMinutes) {
        return res.status(401).json({ 
          message: 'Session timeout, please login again', 
          code: 'SESSION_TIMEOUT' 
        });
      }

      // Update last activity time (no need to await if not critical path)
      updateLastActivity(req.user._id); 

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// DEPRECATED: Use protect + checkPermission('admin:full_access') or similar instead
// const adminProtect = async (req, res, next) => { ... }; 

// Middleware to restrict access based on role NAME (Simple Check)
const authorize = (...roleNames) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Not authorized to access this route (no user/role)' });
    }
    // Check if user's role name is in the allowed list
    if (!roleNames.includes(req.user.role.name)) {
      return res.status(403).json({ message: `User role '${req.user.role.name}' is not authorized to access this route` });
    }
    next();
  };
};

// Middleware to check for specific permissions
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role || !req.user.role.permissions) {
        return res.status(401).json({ message: 'Not authorized to access this route (no user/permissions)' });
    }
    
    // Check if the user's role includes the required permission
    // Allows for a super-admin permission like 'admin:full_access' to bypass specific checks
    const hasPermission = 
      req.user.role.permissions.includes(requiredPermission) || 
      req.user.role.permissions.includes('admin:full_access');

    if (!hasPermission) {
      return res.status(403).json({ message: `Forbidden: Required permission '${requiredPermission}' missing.` });
    }
    
    next();
  };
};

module.exports = { protect, authorize, checkPermission }; 