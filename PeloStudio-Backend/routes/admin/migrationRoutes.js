const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const migrationController = require('../../controllers/admin/migrationController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

// Migration routes
router.post('/run', migrationController.runMigrations);
router.post('/create', migrationController.createMigration);
router.post('/undo', migrationController.undoMigration);
router.get('/status', migrationController.getMigrationStatus);

module.exports = router; 