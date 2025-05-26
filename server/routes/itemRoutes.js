const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get all items
router.get('/', itemController.getAllItems);

// Get items by status
router.get('/status/:status', itemController.getItemsByStatus);

// Get dashboard statistics
router.get('/stats/dashboard', itemController.getDashboardStats);

// Create a new item
router.post('/', itemController.createItem);

// Update an item
router.put('/:id', itemController.updateItem);

// Change item status
router.patch('/:id/status', itemController.changeItemStatus);

// Restore a deleted item
router.put('/:id/restore', itemController.restoreItem);

// Delete an item (only for Super Admin)
router.delete('/:id', adminMiddleware, itemController.deleteItem);

module.exports = router; 