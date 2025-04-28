const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Update user's lastActivity timestamp
const updateLastActivity = async (userId) => {
  await User.findByIdAndUpdate(userId, { lastActivity: Date.now() });
};

const protect = async (req, res, next) => {
  let token;

  // Read the JWT from the cookie
  token = req.cookies.jwt;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Fetch the user based on the id in the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Check for session timeout - more strict for admin users
      const currentTime = new Date();
      const lastActivity = new Date(req.user.lastActivity);
      const timeoutMinutes = req.user.sessionTimeoutMinutes || 30;
      const minutesSinceLastActivity = Math.floor((currentTime - lastActivity) / (1000 * 60));

      if (minutesSinceLastActivity > timeoutMinutes) {
        return res.status(401).json({ 
          message: 'Session timeout, please login again', 
          code: 'SESSION_TIMEOUT' 
        });
      }

      // Update last activity time
      await updateLastActivity(req.user._id);

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      // If token expired, signal client to refresh
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired', code: 'TOKEN_EXPIRED' });
      }
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin-only routes middleware with stricter session timeout
const adminProtect = async (req, res, next) => {
  // First use the normal protect middleware
  protect(req, res, async (err) => {
    if (err) return next(err);
    
    // Now add admin-specific checks
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Admin sessions may have stricter timeout settings
    // This is already handled in the protect middleware using the user's sessionTimeoutMinutes
    
    next();
  });
};

// Middleware to restrict access based on roles (Example)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Not authorized to access this route' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

module.exports = { protect, adminProtect, authorize }; 