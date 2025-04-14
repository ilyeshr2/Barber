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

// Import admin routes
const adminAppointmentRoutes = require('./routes/admin/appointmentRoutes');
const adminClientRoutes = require('./routes/admin/clientRoutes');
const adminBarberRoutes = require('./routes/admin/barberRoutes');
const adminServiceRoutes = require('./routes/admin/serviceRoutes');
const adminSalonRoutes = require('./routes/admin/salonRoutes');
const adminPublicationRoutes = require('./routes/admin/publicationRoutes');
const adminSettingsRoutes = require('./routes/admin/settingsRoutes');

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
router.get('/barbers/:id/services', barbersController.getBarberServices);
router.get('/publications', publicationsController.getAllPublications);
router.get('/settings', settingsController.getPublicSettings);

// Protected routes that require authentication
router.get('/appointments', authenticateToken, appointmentsController.getUserAppointments);
router.post('/appointments', authenticateToken, appointmentsController.createAppointment);
router.put('/appointments/:id/cancel', authenticateToken, appointmentsController.cancelAppointment);
router.get('/appointments/check-availability', appointmentsController.checkAvailability);

// Admin routes
router.use('/admin/appointments', adminAppointmentRoutes);
router.use('/admin/clients', adminClientRoutes);
router.use('/admin/barbers', adminBarberRoutes);
router.use('/admin/services', adminServiceRoutes);
router.use('/admin/salon', adminSalonRoutes);
router.use('/admin/publications', adminPublicationRoutes);
router.use('/admin/settings', adminSettingsRoutes);

module.exports = router;