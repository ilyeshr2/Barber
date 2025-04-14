const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const publicationsController = require('../../controllers/publicationController');

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.get('/', publicationsController.getAllPublications);
router.get('/:id', publicationsController.getPublicationById);
router.post('/', publicationsController.createPublication);
router.put('/:id', publicationsController.updatePublication);
router.delete('/:id', publicationsController.deletePublication);

module.exports = router; 