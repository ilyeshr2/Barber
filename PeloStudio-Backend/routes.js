const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Import controllers
const authController = require('./controllers/authController');
const barbersController = require('./controllers/barbierController');
const servicesController = require('./controllers/servicesController');
const appointmentsController = require('./controllers/appointmentsController');
const salonController = require('./controllers/salonController');
const publicationsController = require('./controllers/publicationController');
const settingsController = require('./controllers/settingsController');
const directQueriesController = require('./controllers/directQueries');

// Import middleware
const { authenticateToken } = require('./middlewares/authMiddleware');

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authenticateToken, authController.getProfile);
router.put('/auth/profile', authenticateToken, authController.updateProfile);

// Public routes
router.get('/salon', salonController.getSalonInfo);
router.get('/barbers', barbersController.getAllBarbers);
router.get('/barbers/:id', barbersController.getBarberById);
router.get('/barbers/:id/services', directQueriesController.getBarberServices);
router.get('/publications', publicationsController.getAllPublications);
router.get('/settings', settingsController.getPublicSettings);

// Protected routes that require authentication
router.get('/appointments', authenticateToken, appointmentsController.getUserAppointments);
router.post('/appointments', authenticateToken, appointmentsController.createAppointment);
router.put('/appointments/:id/cancel', authenticateToken, appointmentsController.cancelAppointment);
router.get('/appointments/check-availability', appointmentsController.checkAvailability);

module.exports = router;