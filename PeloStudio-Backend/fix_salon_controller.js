/**
 * This script creates a patch for the salonController.js file
 * to ensure it properly includes and handles business hours.
 */
const fs = require('fs');
const path = require('path');

// Controller paths
const controllerPath = path.join(__dirname, 'controllers', 'salonController.js');

// Check if file exists
if (!fs.existsSync(controllerPath)) {
  console.error(`Controller file not found at: ${controllerPath}`);
  process.exit(1);
}

// Read controller file
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Updated getSalonInfo function
const updatedGetSalonInfoFunction = `exports.getSalonInfo = async (req, res) => {
  try {
    const salon = await Salon.findOne({
      include: [
        {
          model: BusinessHours,
          attributes: ['day_of_week', 'is_open', 'open_time', 'close_time']
        },
        {
          model: SocialLinks,
          attributes: ['platform', 'url']
        }
      ]
    });

    if (!salon) {
      return res.status(404).json({ message: 'Salon information not found' });
    }

    // Format business hours for frontend
    const businessHours = salon.BusinessHours || [];
    
    // Format social links as an object
    const socialLinks = {};
    if (salon.SocialLinks && salon.SocialLinks.length > 0) {
      salon.SocialLinks.forEach(link => {
        socialLinks[link.platform] = link.url;
      });
    }
    
    // Prepare response with both relationships and direct properties
    const response = {
      ...salon.toJSON(),
      socialLinks,
      businessHours
    };
    
    // Ensure businessHours is present even if empty
    if (!response.businessHours) {
      response.businessHours = [];
    }
    
    // Log the response for debugging
    console.log('getSalonInfo response:', {
      id: response.id,
      name: response.name,
      businessHoursCount: response.businessHours?.length || 0,
      socialLinksCount: Object.keys(response.socialLinks).length
    });
    
    res.json(response);
  } catch (error) {
    console.error('Error getting salon info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};`;

// Find and replace the getSalonInfo function
const getSalonInfoRegex = /exports\.getSalonInfo\s*=\s*async\s*\(req,\s*res\)\s*=>\s*{[\s\S]*?};/;
if (controllerContent.match(getSalonInfoRegex)) {
  controllerContent = controllerContent.replace(getSalonInfoRegex, updatedGetSalonInfoFunction);
} else {
  console.error('Could not find getSalonInfo function in controller file');
  process.exit(1);
}

// Create backup and updated files
const backupPath = controllerPath + '.bak';
const tempPath = controllerPath + '.new';

fs.writeFileSync(backupPath, fs.readFileSync(controllerPath));
console.log(`Created backup at: ${backupPath}`);

fs.writeFileSync(tempPath, controllerContent);
console.log(`Created updated controller at: ${tempPath}`);

console.log('\nInstructions to apply the fix:');
console.log(`1. Review the changes in ${tempPath}`);
console.log(`2. Apply the fix by running:`);
console.log(`   mv "${tempPath}" "${controllerPath}"`);
console.log('\nAfter applying both fixes, restart your backend server.');

// Print information about how to run the sync script
console.log('\nTo sync business hours between database tables, run:');
console.log('node fix_business_hours_table.js'); 