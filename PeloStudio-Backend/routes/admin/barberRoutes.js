const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const barbersController = require('../../controllers/barbierController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.get('/', barbersController.getAllBarbers);
router.get('/:id', barbersController.getBarberById);
router.post('/', barbersController.createBarber);
router.put('/:id', barbersController.updateBarber);
router.delete('/:id', barbersController.deleteBarber);

module.exports = router; 