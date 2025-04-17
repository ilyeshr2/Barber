const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const activityController = require('../../controllers/admin/activityController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

// Get recent activities
router.get('/', activityController.getRecentActivities);

module.exports = router; 