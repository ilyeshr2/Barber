const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const clientsController = require('../../controllers/admin/clientsController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.get('/', clientsController.getAllClients);
router.get('/:id', clientsController.getClientById);
router.get('/:id/appointments', clientsController.getClientAppointments);
router.post('/', clientsController.createClient);
router.put('/:id', clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

module.exports = router; 