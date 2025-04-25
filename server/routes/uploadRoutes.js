const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Upload image
router.post('/image', uploadController.uploadImage);

// Delete image
router.delete('/image/:filename', uploadController.deleteImage);

module.exports = router; 