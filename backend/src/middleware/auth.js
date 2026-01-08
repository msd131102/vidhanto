const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    console.log('Auth middleware - Token received:', token ? 'YES' : 'NO');
    
    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded:', { id: decoded.id, iat: decoded.iat, exp: decoded.exp });
    
    const user = await User.findById(decoded.id).select('-password');
    console.log('Auth middleware - User found:', user ? 'YES' : 'NO');
    
    if (!user) {
      console.log('Auth middleware - User not found in database');
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User not found.' 
      });
    }

    if (!user.isActive) {
      console.log('Auth middleware - User is deactivated');
      return res.status(401).json({ 
        success: false, 
        message: 'Account is deactivated.' 
      });
    }

    req.user = user;
    console.log('Auth middleware - Authentication successful');
    next();
  } catch (error) {
    console.log('Auth middleware - Error:', error.name, error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error in authentication.' 
    });
  }
};

// Middleware to check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. User not authenticated.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. ${req.user.role} role is not authorized.` 
      });
    }

    next();
  };
};

// Middleware to check if user is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return res.status(403).json({ 
      success: false, 
      message: 'Email verification required.' 
    });
  }
  next();
};

// Middleware to check if user is lawyer and verified
const requireLawyerVerification = async (req, res, next) => {
  if (req.user.role !== 'lawyer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Lawyer role required.' 
    });
  }

  const Lawyer = require('../models/Lawyer');
  const lawyer = await Lawyer.findOne({ userId: req.user._id });
  
  if (!lawyer) {
    return res.status(403).json({ 
      success: false, 
      message: 'Lawyer profile not found.' 
    });
  }

  if (lawyer.kycStatus !== 'verified') {
    return res.status(403).json({ 
      success: false, 
      message: 'KYC verification required.' 
    });
  }

  req.lawyer = lawyer;
  next();
};

// Middleware to check resource ownership
const checkOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam];
      const Model = require(`../models/${resourceModel}`);
      
      const resource = await Model.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({ 
          success: false, 
          message: `${resourceModel} not found.` 
        });
      }

      // Check if user owns the resource or is admin
      const userId = resource.userId || resource.userId?.toString();
      const isOwner = userId && userId.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      if (!isOwner && !isAdmin) {
        return res.status(403).json({ 
          success: false, 
          message: 'Access denied. You do not own this resource.' 
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: 'Error checking resource ownership.' 
      });
    }
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

// Rate limiting middleware for specific actions
const rateLimitByUser = (maxRequests = 10, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();
  
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }
    
    const userId = req.user._id.toString();
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      });
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    next();
  };
};

module.exports = {
  authenticate,
  authorize,
  requireEmailVerification,
  requireLawyerVerification,
  checkOwnership,
  optionalAuth,
  rateLimitByUser
};
