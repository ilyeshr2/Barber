//routes.js
const express = require('express');
const router = express.Router();
const authController = require('./controllers/authController');
const barbierController = require('./controllers/barbierController');
const rendezVousController = require('./controllers/rendezVousController');
const authMiddleware = require('./middlewares/authMiddleware');
const { sequelize } = require('./models');
const { Op } = require('sequelize');

// Auth routes
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/profile', authMiddleware, authController.getProfile);
router.put('/auth/profile', authMiddleware, authController.updateProfile);

// Barber routes
router.get('/barbers', barbierController.getAllBarbers);
router.get('/barbers/:id', barbierController.getBarberById);
router.get('/barbers/:id/services', barbierController.getBarberServices);

// Appointment routes
router.get('/appointments', authMiddleware, rendezVousController.getUserAppointments);
router.post('/appointments', authMiddleware, rendezVousController.createAppointment);
router.put('/appointments/:id/cancel', authMiddleware, rendezVousController.cancelAppointment);

// Make sure this route comes BEFORE the /:id ones to avoid path conflicts
router.get('/appointments/check-availability', rendezVousController.checkAvailability);

// Admin appointments routes (if needed)
// router.get('/appointments/upcoming', authMiddleware, rendezVousController.getUpcomingAppointments);
// router.put('/appointments/:id/complete', authMiddleware, rendezVousController.completeAppointment);

// Debug endpoint
router.get('/debug/services/:id', async (req, res) => {
    try {
      // Use direct SQL query to bypass potential Sequelize issues
      const [results] = await sequelize.query(`
        SELECT * FROM "Services" WHERE "BarberId" = ${req.params.id}
      `);
      
      res.json({
        count: results.length,
        services: results
      });
    } catch (error) {
      console.error('Debug endpoint error:', error);
      res.status(500).json({ message: 'Error in debug endpoint', error: error.message });
    }
  });

module.exports = router;