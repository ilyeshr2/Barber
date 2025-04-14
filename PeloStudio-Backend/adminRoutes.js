const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Import controllers
const adminAuthController = require('./controllers/admin/authController');
const adminBarbersController = require('./controllers/admin/barbersController');
const adminServicesController = require('./controllers/admin/servicesController');
const adminAppointmentsController = require('./controllers/admin/appointmentsController');
const adminClientsController = require('./controllers/admin/clientsController');
const adminSalonController = require('./controllers/admin/salonController');
const adminPublicationsController = require('./controllers/admin/publicationsController');
const adminSettingsController = require('./controllers/admin/settingsController');

// Import middleware
const { authenticateToken, isAdmin } = require('./middlewares/authMiddleware');

// Apply both auth and admin middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Admin Auth
router.get('/profile', adminAuthController.getProfile);
router.put('/profile', adminAuthController.updateProfile);

// Barbers management
router.get('/barbers', adminBarbersController.getAllBarbers);
router.get('/barbers/:id', adminBarbersController.getBarberById);
router.post('/barbers', upload.single('photo'), adminBarbersController.createBarber);
router.put('/barbers/:id', upload.single('photo'), adminBarbersController.updateBarber);
router.delete('/barbers/:id', adminBarbersController.deleteBarber);

// Services management
router.get('/services', adminServicesController.getAllServices);
router.get('/services/:id', adminServicesController.getServiceById);
router.post('/services', adminServicesController.createService);
router.put('/services/:id', adminServicesController.updateService);
router.delete('/services/:id', adminServicesController.deleteService);

// Appointments management
router.get('/appointments', adminAppointmentsController.getAllAppointments);
router.get('/appointments/upcoming', adminAppointmentsController.getUpcomingAppointments);
router.get('/appointments/by-date', adminAppointmentsController.getAppointmentsByDate);
router.post('/appointments', adminAppointmentsController.createAppointment);
router.put('/appointments/:id/status', adminAppointmentsController.updateAppointmentStatus);
router.delete('/appointments/:id', adminAppointmentsController.deleteAppointment);

// Clients management
router.get('/clients', adminClientsController.getAllClients);
router.get('/clients/:id', adminClientsController.getClientById);
router.get('/clients/:id/appointments', adminClientsController.getClientAppointments);
router.post('/clients', adminClientsController.createClient);
router.put('/clients/:id', adminClientsController.updateClient);
router.delete('/clients/:id', adminClientsController.deleteClient);

// Salon information management
router.put('/salon', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), adminSalonController.updateSalonInfo);
router.put('/salon/hours', adminSalonController.updateBusinessHours);

// Publications management
router.get('/publications', adminPublicationsController.getAllPublications);
router.get('/publications/:id', adminPublicationsController.getPublicationById);
router.post('/publications', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'authorImage', maxCount: 1 }
]), adminPublicationsController.createPublication);
router.put('/publications/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'authorImage', maxCount: 1 }
]), adminPublicationsController.updatePublication);
router.delete('/publications/:id', adminPublicationsController.deletePublication);

// Settings management
router.get('/settings', adminSettingsController.getAllSettings);
router.put('/settings/:key', adminSettingsController.updateSetting);

module.exports = router;