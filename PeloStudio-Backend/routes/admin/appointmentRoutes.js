const express = require('express');
const router = express.Router();
const appointmentsController = require('../../controllers/appointmentsController');
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.get('/', appointmentsController.getAllAppointments);
router.get('/today', appointmentsController.getTodayAppointments);
router.get('/upcoming', appointmentsController.getUpcomingAppointments);
router.get('/by-date', appointmentsController.getAppointmentsByDate);
router.post('/', appointmentsController.createAppointment);
router.put('/:id/status', appointmentsController.updateAppointmentStatus);
router.delete('/:id', appointmentsController.deleteAppointment);

module.exports = router; 