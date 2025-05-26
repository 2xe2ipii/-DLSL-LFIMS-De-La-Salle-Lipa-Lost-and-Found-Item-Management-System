const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Register a new user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);

// Get current user (protected route)
router.get('/me', authMiddleware, authController.getCurrentUser);

// Change password (protected route)
router.post('/change-password', authMiddleware, authController.changePassword);

// Create admin user (superadmin only)
router.post('/create-user', authMiddleware, adminMiddleware, authController.createUser);

// Reset admin passwords (superadmin only)
router.post('/reset-admin-passwords', authMiddleware, adminMiddleware, authController.resetAdminPasswords);

// Test authenticated route (anyone logged in)
router.get('/test-auth', authMiddleware, (req, res) => {
  res.json({ 
    message: 'Authentication successful', 
    user: {
      id: req.user.id,
      role: req.user.role
    }
  });
});

module.exports = router; 