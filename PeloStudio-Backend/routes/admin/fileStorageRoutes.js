const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');
const fileStorageController = require('../../controllers/admin/fileStorageController');

// Configure Multer for file uploads with temporary storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'temp-uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, `temp-${Date.now()}-${path.basename(file.originalname)}`);
  }
});

// Filter to accept only image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  },
  fileFilter: fileFilter
});

// Ensure temp uploads directory exists
const fs = require('fs');
if (!fs.existsSync('temp-uploads/')) {
  fs.mkdirSync('temp-uploads/', { recursive: true });
}

// Protected admin routes
router.use(authenticateToken, isAdmin);

// File storage routes
router.post('/upload', upload.single('file'), fileStorageController.uploadFile);
router.get('/', fileStorageController.getAllFiles);
router.get('/search', fileStorageController.searchFiles);
router.get('/:id', fileStorageController.getFileById);
router.delete('/:id', fileStorageController.deleteFile);

module.exports = router; 