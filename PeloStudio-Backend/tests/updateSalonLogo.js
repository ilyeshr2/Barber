// Script to test updating the salon logo directly in the database
const db = require('../models');
const { Salon, FileStorage } = db;
const fs = require('fs');
const path = require('path');

async function updateSalonLogo() {
  try {
    console.log('Starting test to update salon logo...');
    
    // Find the salon record
    let salon = await Salon.findOne();
    
    if (!salon) {
      console.log('No salon record found in the database');
      return;
    }
    
    console.log('Current salon record:');
    console.log(JSON.stringify(salon.toJSON(), null, 2));
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../uploads/salon');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Test file path (using a dummy file path for testing)
    const testLogoFileName = `test-logo-${Date.now()}.png`;
    const testLogoFilePath = path.join(uploadDir, testLogoFileName);
    
    // Copy default logo to new test file
    const defaultLogoPath = path.join(__dirname, '../uploads/salon/default-logo.png');
    if (fs.existsSync(defaultLogoPath)) {
      fs.copyFileSync(defaultLogoPath, testLogoFilePath);
      console.log(`Created test logo file at: ${testLogoFilePath}`);
    } else {
      // Create a simple 1x1 pixel test image if default not available
      const testImageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 
        'base64'
      );
      fs.writeFileSync(testLogoFilePath, testImageBuffer);
      console.log(`Created new 1x1 pixel test logo at: ${testLogoFilePath}`);
    }
    
    // Create file metadata in database
    const fileData = await FileStorage.create({
      original_name: testLogoFileName,
      file_path: `/uploads/salon/${testLogoFileName}`,
      file_size: fs.statSync(testLogoFilePath).size,
      mime_type: 'image/png',
      category: 'salon',
      upload_date: new Date()
    });
    
    console.log('Created file storage record:');
    console.log(JSON.stringify(fileData.toJSON(), null, 2));
    
    // Update salon logo_url
    salon.logo_url = fileData.file_path;
    await salon.save();
    
    console.log('Updated salon record:');
    console.log(JSON.stringify(salon.toJSON(), null, 2));
    
    console.log('\nTest completed successfully. Verify that:');
    console.log(`1. The logo_url field was updated to: ${salon.logo_url}`);
    console.log('2. The logo is visible in the frontend after refreshing');
  } catch (error) {
    console.error('Error updating salon logo:', error);
  }
}

// Run the test
updateSalonLogo()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 