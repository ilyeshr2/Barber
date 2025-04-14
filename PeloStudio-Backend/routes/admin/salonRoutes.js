const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const salonController = require('../../controllers/salonController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.put('/info', salonController.updateSalonInfo);
router.put('/hours', salonController.updateBusinessHours);

module.exports = router; 