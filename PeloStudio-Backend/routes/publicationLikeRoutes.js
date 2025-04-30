const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/authMiddleware');
const publicationLikeController = require('../controllers/publicationLikeController');

// Protected routes
router.use(authenticateToken);

// Like a publication
router.post('/:publicationId', publicationLikeController.likePublication);

// Unlike a publication
router.delete('/:publicationId', publicationLikeController.unlikePublication);

// Get likes for a publication
router.get('/:publicationId', publicationLikeController.getPublicationLikes);

// Check if current user has liked a publication
router.get('/:publicationId/status', publicationLikeController.getLikeStatus);

module.exports = router; 