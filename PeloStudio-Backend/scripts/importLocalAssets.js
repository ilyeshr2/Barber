#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { FileStorage, Barber, Salon, Publication } = require('../models');
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const copyFile = promisify(fs.copyFile);
require('dotenv').config();

// Define source path for app assets
const APP_ASSETS_PATH = path.resolve('../app/assets/images');

// Create destination directories if they don't exist
const setupDirectories = () => {
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const directories = ['barbers', 'salon', 'publications', 'users', 'misc'];
  directories.forEach(dir => {
    if (!fs.existsSync(path.join(uploadDir, dir))) {
      fs.mkdirSync(path.join(uploadDir, dir), { recursive: true });
    }
  });
  
  console.log('Upload directories created successfully');
};

// Copy files from app assets to upload directory
const copyFiles = async (sourceDir, destCategory) => {
  try {
    // Create the destination category directory if it doesn't exist
    const destDir = path.join(__dirname, '../uploads', destCategory);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Get all files in the source directory
    const files = await readdir(sourceDir);
    const results = {
      copied: 0,
      failed: 0,
      details: [],
      errors: []
    };
    
    // Process each file
    for (const file of files) {
      try {
        const filePath = path.join(sourceDir, file);
        const fileStats = await stat(filePath);
        
        // Skip directories and non-image files
        if (fileStats.isDirectory() || !file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          continue;
        }
        
        // Create a unique filename for the destination
        const destFileName = `${Date.now()}-${file}`;
        const destFilePath = path.join(destDir, destFileName);
        
        // Copy the file to the uploads directory
        await copyFile(filePath, destFilePath);
        
        // Store file metadata in the database
        const fileData = await FileStorage.create({
          original_name: file,
          file_path: `/uploads/${destCategory}/${destFileName}`,
          file_size: fileStats.size,
          mime_type: `image/${path.extname(file).substring(1)}`,
          category: destCategory,
          upload_date: new Date()
        });
        
        results.copied++;
        results.details.push({
          original: file,
          path: fileData.file_path,
          id: fileData.id
        });
        
        console.log(`Copied ${file} to ${fileData.file_path}`);
      } catch (error) {
        results.failed++;
        results.errors.push({
          file,
          error: error.message
        });
        console.error(`Failed to copy ${file}: ${error.message}`);
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error copying files to ${destCategory}:`, error);
    throw error;
  }
};

// Update database references to point to new file paths
const updateDatabaseReferences = async () => {
  try {
    const results = {
      updated: {
        barbers: 0,
        publications: 0,
        salon: 0
      },
      errors: []
    };
    
    // Get all files in the database
    const allFiles = await FileStorage.findAll();
    
    // Create a map of original filenames to file paths
    const fileMap = {};
    allFiles.forEach(file => {
      const baseName = path.basename(file.original_name);
      fileMap[baseName] = file.file_path;
    });
    
    // Update barber photos
    const barbers = await Barber.findAll();
    for (const barber of barbers) {
      try {
        // Try to match the barber photo to an uploaded file
        const photoBaseName = path.basename(barber.photo_url || '');
        if (photoBaseName && fileMap[photoBaseName]) {
          barber.photo_url = fileMap[photoBaseName];
          await barber.save();
          results.updated.barbers++;
          console.log(`Updated barber ${barber.name} photo to ${barber.photo_url}`);
        } else if (barber.photo_url && barber.photo_url.startsWith('/uploads/')) {
          // Already using the correct format, skip
          console.log(`Barber ${barber.name} already using local file: ${barber.photo_url}`);
        } else {
          // Use a default barber image if not found
          barber.photo_url = '/uploads/barbers/default-barber.jpg';
          await barber.save();
          results.updated.barbers++;
          console.log(`Set default photo for barber ${barber.name}`);
        }
      } catch (error) {
        results.errors.push({
          type: 'barber',
          id: barber.id,
          error: error.message
        });
        console.error(`Failed to update barber ${barber.id}:`, error);
      }
    }
    
    // Update salon images
    const salon = await Salon.findOne();
    if (salon) {
      try {
        let updated = false;
        
        // Try to match the logo to an uploaded file
        const logoBaseName = path.basename(salon.logo_url || '');
        if (logoBaseName && fileMap[logoBaseName]) {
          salon.logo_url = fileMap[logoBaseName];
          updated = true;
        } else if (salon.logo_url && salon.logo_url.startsWith('/uploads/')) {
          // Already using the correct format, skip
          console.log(`Salon already using local logo: ${salon.logo_url}`);
        } else {
          // Use a default logo if not found
          salon.logo_url = '/uploads/salon/default-logo.png';
          updated = true;
        }
        
        // Try to match the image to an uploaded file
        const imageBaseName = path.basename(salon.image_url || '');
        if (imageBaseName && fileMap[imageBaseName]) {
          salon.image_url = fileMap[imageBaseName];
          updated = true;
        } else if (salon.image_url && salon.image_url.startsWith('/uploads/')) {
          // Already using the correct format, skip
          console.log(`Salon already using local image: ${salon.image_url}`);
        } else {
          // Use a default image if not found
          salon.image_url = '/uploads/salon/default-salon.jpg';
          updated = true;
        }
        
        if (updated) {
          await salon.save();
          results.updated.salon = 1;
          console.log('Updated salon image URLs');
        }
      } catch (error) {
        results.errors.push({
          type: 'salon',
          error: error.message
        });
        console.error('Failed to update salon:', error);
      }
    }
    
    // Update publication images
    const publications = await Publication.findAll();
    for (const publication of publications) {
      try {
        let updated = false;
        
        // Try to match the image to an uploaded file
        const imageBaseName = path.basename(publication.image_url || '');
        if (imageBaseName && fileMap[imageBaseName]) {
          publication.image_url = fileMap[imageBaseName];
          updated = true;
        } else if (publication.image_url && publication.image_url.startsWith('/uploads/')) {
          // Already using the correct format, skip
          console.log(`Publication ${publication.id} already using local image: ${publication.image_url}`);
        }
        
        // Try to match the author image to an uploaded file
        const authorImageBaseName = path.basename(publication.author_image || '');
        if (authorImageBaseName && fileMap[authorImageBaseName]) {
          publication.author_image = fileMap[authorImageBaseName];
          updated = true;
        } else if (publication.author_image && publication.author_image.startsWith('/uploads/')) {
          // Already using the correct format, skip
          console.log(`Publication ${publication.id} already using local author image: ${publication.author_image}`);
        }
        
        if (updated) {
          await publication.save();
          results.updated.publications++;
          console.log(`Updated publication ${publication.id} image URLs`);
        }
      } catch (error) {
        results.errors.push({
          type: 'publication',
          id: publication.id,
          error: error.message
        });
        console.error(`Failed to update publication ${publication.id}:`, error);
      }
    }
    
    return results;
  } catch (error) {
    console.error('Database update failed:', error);
    throw error;
  }
};

// Main migration function
async function main() {
  try {
    console.log('Starting local asset migration...');
    console.log(`Source path: ${APP_ASSETS_PATH}`);
    
    // Set up directories
    setupDirectories();
    
    // Barber photos - Look for images with 'barber' in the name or specific named files
    console.log('\n=== Copying Barber Photos ===');
    await copyFiles(APP_ASSETS_PATH, 'barbers');
    
    // Salon images
    console.log('\n=== Copying Salon Images ===');
    await copyFiles(APP_ASSETS_PATH, 'salon');
    
    // Publication images
    console.log('\n=== Copying Publication Images ===');
    await copyFiles(APP_ASSETS_PATH, 'publications');
    
    // Update database references
    console.log('\n=== Updating Database References ===');
    const dbResults = await updateDatabaseReferences();
    
    console.log('\n=== Migration Complete ===');
    console.log('Database updates:');
    console.log(`- Barbers: ${dbResults.updated.barbers}`);
    console.log(`- Publications: ${dbResults.updated.publications}`);
    console.log(`- Salon: ${dbResults.updated.salon}`);
    
    if (dbResults.errors.length > 0) {
      console.log('\nErrors occurred during database updates:');
      dbResults.errors.forEach(error => {
        console.log(`- ${error.type} ${error.id || ''}: ${error.error}`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
main(); 