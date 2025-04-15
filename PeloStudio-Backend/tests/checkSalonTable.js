// Script to check the salon table in the database
const db = require('../models');
const { Salon, FileStorage } = db;
const { Op } = require('sequelize');

async function checkSalonTable() {
  try {
    console.log('Checking Salon table...');
    
    // Find the salon record
    const salon = await Salon.findOne();
    
    if (!salon) {
      console.log('No salon record found in the database');
      return;
    }
    
    console.log('Salon record found:');
    console.log(JSON.stringify(salon.toJSON(), null, 2));
    
    // Check file records related to the salon
    if (salon.logo_url || salon.image_url) {
      console.log('\nChecking related files...');
      
      const fileConditions = [];
      if (salon.logo_url) {
        console.log('Looking for logo file:', salon.logo_url);
        fileConditions.push({ file_path: salon.logo_url });
      }
      
      if (salon.image_url) {
        console.log('Looking for image file:', salon.image_url);
        fileConditions.push({ file_path: salon.image_url });
      }
      
      const fileRecords = await FileStorage.findAll({
        where: {
          [Op.or]: fileConditions
        }
      });
      
      if (fileRecords.length > 0) {
        console.log(`Found ${fileRecords.length} related file records:`);
        fileRecords.forEach(file => {
          console.log(JSON.stringify(file.toJSON(), null, 2));
        });
      } else {
        console.log('No related file records found');
      }
    }
    
    console.log('\nDatabase check complete');
  } catch (error) {
    console.error('Error checking salon table:', error);
  }
}

// Run the check
checkSalonTable()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 