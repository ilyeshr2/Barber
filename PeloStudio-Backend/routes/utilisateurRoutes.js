// PeloStudio-Backend/routes.js

const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const barbierController = require('./controllers/barbierController');
const rendezVousController = require('./controllers/rendezVousController');
const authMiddleware = require('./middlewares/authMiddleware');

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);

// Barber routes
router.get('/barbers', barbierController.getAllBarbers);
router.get('/barbers/:id', barbierController.getBarberById);
router.get('/barbers/:id/services', barbierController.getBarberServices);

// Appointment routes
router.get('/appointments', authMiddleware, rendezVousController.getUserAppointments);
router.post('/appointments', authMiddleware, rendezVousController.createAppointment);
router.put('/appointments/:id/cancel', authMiddleware, rendezVousController.cancelAppointment);

module.exports = router;