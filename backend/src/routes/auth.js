const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const { validate, userSchemas } = require('../middlewares/validation');
const { auditLogger, authLimiter } = require('../middlewares/security');

// Public routes (with rate limiting)
router.post('/register', 
  authLimiter,
  validate(userSchemas.register),
  auditLogger('REGISTER', 'user'),
  authController.register
);

router.post('/login', 
  authLimiter,
  validate(userSchemas.login),
  auditLogger('LOGIN', 'user'),
  authController.login
);

router.post('/refresh-token', 
  authLimiter,
  authController.refreshToken
);

// Protected routes
router.post('/logout', 
  authenticateToken,
  auditLogger('LOGOUT', 'user'),
  authController.logout
);

router.get('/profile', 
  authenticateToken,
  authController.getProfile
);

router.put('/profile', 
  authenticateToken,
  validate(userSchemas.updateProfile),
  auditLogger('UPDATE_PROFILE', 'user'),
  authController.updateProfile
);

router.put('/change-password', 
  authenticateToken,
  validate(userSchemas.changePassword),
  auditLogger('CHANGE_PASSWORD', 'user'),
  authController.changePassword
);

router.get('/verify-token', 
  authenticateToken,
  authController.verifyToken
);

module.exports = router;