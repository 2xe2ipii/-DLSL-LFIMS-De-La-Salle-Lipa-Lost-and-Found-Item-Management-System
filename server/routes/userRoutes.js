const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Get all admin users (superAdmin only)
router.get('/admins', authMiddleware, adminMiddleware, userController.getAdminUsers);

module.exports = router; 