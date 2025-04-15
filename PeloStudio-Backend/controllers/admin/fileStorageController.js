const fs = require('fs');
const path = require('path');
const { FileStorage } = require('../../models');
const { Op } = require('sequelize');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
const createDirectories = () => {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Create specific directories for different file types
  const directories = ['barbers', 'salon', 'publications', 'users', 'misc'];
  directories.forEach(dir => {
    if (!fs.existsSync(path.join(uploadsDir, dir))) {
      fs.mkdirSync(path.join(uploadsDir, dir), { recursive: true });
    }
  });
};

createDirectories();

// Upload a file to the server and store metadata in the database
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Determine file category from request
    const { category = 'misc' } = req.body;
    const validCategories = ['barbers', 'salon', 'publications', 'users', 'misc'];
    const fileCategory = validCategories.includes(category) ? category : 'misc';
    
    // Create relative path for file - this will be stored in the database
    const fileName = `${Date.now()}-${path.basename(req.file.originalname)}`;
    const relativePath = `/uploads/${fileCategory}/${fileName}`;
    const fullPath = path.join(uploadsDir, fileCategory, fileName);
    
    // Move file from temp location to final destination
    fs.renameSync(req.file.path, fullPath);
    
    // Store file metadata in the database
    const fileData = await FileStorage.create({
      original_name: req.file.originalname,
      file_path: relativePath,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      category: fileCategory,
      upload_date: new Date()
    });
    
    res.status(201).json({
      id: fileData.id,
      original_name: fileData.original_name,
      file_path: fileData.file_path,
      file_size: fileData.file_size,
      mime_type: fileData.mime_type,
      category: fileData.category,
      upload_date: fileData.upload_date
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    
    // If file was saved to temp location, try to clean up
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Failed to clean up temp file:', cleanupError);
      }
    }
    
    res.status(500).json({ message: 'Server error while uploading file' });
  }
};

// Get all files from the database
exports.getAllFiles = async (req, res) => {
  try {
    const { category } = req.query;
    
    const whereCondition = {};
    if (category) {
      whereCondition.category = category;
    }
    
    const files = await FileStorage.findAll({
      where: whereCondition,
      order: [['upload_date', 'DESC']]
    });
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ message: 'Server error while fetching files' });
  }
};

// Get file by ID
exports.getFileById = async (req, res) => {
  try {
    const file = await FileStorage.findByPk(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.status(200).json(file);
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ message: 'Server error while fetching file' });
  }
};

// Delete file from storage and database
exports.deleteFile = async (req, res) => {
  try {
    const file = await FileStorage.findByPk(req.params.id);
    
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    // Delete the physical file
    const fullPath = path.join(__dirname, '../../', file.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    
    // Delete database entry
    await file.destroy();
    
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ message: 'Server error while deleting file' });
  }
};

// Search files by name or category
exports.searchFiles = async (req, res) => {
  try {
    const { query, category } = req.query;
    
    const whereCondition = {};
    
    if (query) {
      whereCondition.original_name = {
        [Op.iLike]: `%${query}%`
      };
    }
    
    if (category) {
      whereCondition.category = category;
    }
    
    const files = await FileStorage.findAll({
      where: whereCondition,
      order: [['upload_date', 'DESC']]
    });
    
    res.status(200).json(files);
  } catch (error) {
    console.error('Error searching files:', error);
    res.status(500).json({ message: 'Server error while searching files' });
  }
}; 