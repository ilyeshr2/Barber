const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'temp-uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `temp-${Date.now()}-${path.basename(file.originalname)}`);
  }
});

// Create the temp uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('temp-uploads/')) {
  fs.mkdirSync('temp-uploads/', { recursive: true });
}

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  }
});

// Import controllers
const adminAuthController = require('./controllers/admin/authController');
const adminBarbersController = require('./controllers/admin/barbersController');
const adminServicesController = require('./controllers/admin/servicesController');
const adminAppointmentsController = require('./controllers/admin/appointmentsController');
const adminClientsController = require('./controllers/admin/clientsController');
const adminSalonController = require('./controllers/admin/salonController');
const adminPublicationsController = require('./controllers/admin/publicationsController');
const adminSettingsController = require('./controllers/admin/settingsController');
const adminMigrationController = require('./controllers/admin/migrationController');
const adminActivityController = require('./controllers/admin/activityController');

// Import middleware
const { authenticateToken, isAdmin } = require('./middlewares/authMiddleware');

// Import sub-routes
const fileStorageRoutes = require('./routes/admin/fileStorageRoutes');
const migrationRoutes = require('./routes/admin/migrationRoutes');
const salonRoutes = require('./routes/admin/salonRoutes');
const activityRoutes = require('./routes/admin/activityRoutes');

// Apply both auth and admin middleware to all routes
router.use(authenticateToken);
router.use(isAdmin);

// Use sub-routes
router.use('/files', fileStorageRoutes);
router.use('/migrations', migrationRoutes);
router.use('/salon', salonRoutes);
router.use('/activities', activityRoutes);

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

// Database migration routes (direct, without sub-routes)
router.post('/migrate/run', adminMigrationController.runMigrations);
router.post('/migrate/create', adminMigrationController.createMigration);
router.post('/migrate/undo', adminMigrationController.undoMigration);
router.get('/migrate/status', adminMigrationController.getMigrationStatus);

module.exports = router;