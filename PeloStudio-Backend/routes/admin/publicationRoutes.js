const express = require('express');
const router = express.Router();
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const publicationsController = require('../../controllers/admin/publicationsController');
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

// Create temp uploads directory if it doesn't exist
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

// Protected admin routes
router.use(authenticateToken, isAdmin);

router.get('/', publicationsController.getAllPublications);
router.get('/:id', publicationsController.getPublicationById);
router.post('/', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'authorImage', maxCount: 1 }
]), publicationsController.createPublication);
router.put('/:id', upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'authorImage', maxCount: 1 }
]), publicationsController.updatePublication);
router.delete('/:id', publicationsController.deletePublication);

module.exports = router; 