const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const servicesController = require('../../controllers/servicesController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.get('/', servicesController.getAllServices);
router.get('/:id', servicesController.getServiceById);
router.post('/', servicesController.createService);
router.put('/:id', servicesController.updateService);
router.delete('/:id', servicesController.deleteService);

module.exports = router; 