const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

// ============================
// Verify JWT token (Required)
// ============================
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId, {
      include: [{
        model: Role,
        as: 'role'
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or inactive user'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// ============================
// Role-based access control
// ============================
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    const userRole = req.user.role?.name;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// ============================
// Permission-based access
// ============================
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const permissions = req.user.role?.permissions || [];

    if (!permissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Permission denied'
      });
    }

    next();
  };
};

// ============================
// Optional authentication
// ============================
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.userId, {
        include: [{
          model: Role,
          as: 'role'
        }],
        attributes: { exclude: ['password'] }
      });

      if (user && user.is_active) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore errors intentionally
  }

  next();
};

// ============================
// Ownership or Admin access
// ============================
const requireOwnershipOrAdmin = (resourceUserIdField = 'user_id') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRole = req.user.role?.name;
    const userId = String(req.user.id);

    // Admin / Coordinator override
    if (['admin', 'coordinator'].includes(userRole)) {
      return next();
    }

    const resourceUserId =
      req.params.userId ||
      req.body[resourceUserIdField] ||
      req.query[resourceUserIdField];

    if (resourceUserId && String(resourceUserId) !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  requireRole,
  requirePermission,
  optionalAuth,
  requireOwnershipOrAdmin
};
