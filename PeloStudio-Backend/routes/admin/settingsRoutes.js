const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const settingsController = require('../../controllers/settingsController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.get('/', settingsController.getAllSettings);
router.put('/:key', settingsController.updateSetting);

module.exports = router; 