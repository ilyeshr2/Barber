/**
 * This script directly replaces the controller file with a fixed version
 * to ensure proper business hours handling.
 */
const fs = require('fs');
const path = require('path');

// Main controller path
const salonControllerPath = path.join(__dirname, 'controllers', 'salonController.js');

// Create fixed salon controller content
const fixedSalonController = `// controllers/salonController.js - FIXED VERSION
const { Salon, BusinessHours, SocialLinks } = require('../models');
const path = require('path');
const fs = require('fs');

// Helper function to handle file uploads
const handleFileUpload = (file, folderName) => {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../uploads', folderName);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Generate unique filename
  const fileExt = path.extname(file.originalname);
  const fileName = \`\${Date.now()}_\${Math.floor(Math.random() * 10000)}\${fileExt}\`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Write file to disk
  fs.writeFileSync(filePath, file.buffer);
  
  // Return relative path for database storage
  return \`/uploads/\${folderName}/\${fileName}\`;
};

// Get salon information - FIXED to properly include business hours
exports.getSalonInfo = async (req, res) => {
  try {
    console.log('getSalonInfo called');
    
    // Find salon with related data
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

    // Format business hours array
    const businessHoursArray = salon.BusinessHours || [];
    console.log('Business hours from database:', businessHoursArray.length);
    
    // Transform to camelCase for frontend if needed
    const businessHours = businessHoursArray.map(hour => {
      return {
        day_of_week: hour.day_of_week,
        is_open: hour.is_open,
        open_time: hour.open_time,
        close_time: hour.close_time
      };
    });
    
    // If no business hours found in relationship, use JSON field or create default
    if (businessHours.length === 0 && salon.business_hours && Array.isArray(salon.business_hours)) {
      console.log('Using business_hours from JSON field');
      businessHours.push(...salon.business_hours);
    }
    
    // Format social links as an object
    const socialLinks = {};
    salon.SocialLinks.forEach(link => {
      socialLinks[link.platform] = link.url;
    });
    
    // Combine data for response
    const response = {
      ...salon.toJSON(),
      businessHours: businessHours,
      socialLinks
    };
    
    console.log('Response data businessHours length:', response.businessHours?.length || 0);
    
    res.json(response);
  } catch (error) {
    console.error('Error getting salon info:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update salon information
exports.updateSalonInfo = async (req, res) => {
  try {
    const { name, address, phone, email, description, socialLinks } = req.body;
    
    // Find the salon record (there should be only one)
    let salon = await Salon.findOne();
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon information not found' });
    }
    
    // Update basic info
    salon.name = name || salon.name;
    salon.address = address || salon.address;
    salon.phone = phone || salon.phone;
    salon.email = email || salon.email;
    salon.description = description || salon.description;
    
    // Handle logo upload if provided
    if (req.files && req.files.logo) {
      salon.logo_url = handleFileUpload(req.files.logo[0], 'salon');
    }
    
    // Handle image upload if provided
    if (req.files && req.files.image) {
      salon.image_url = handleFileUpload(req.files.image[0], 'salon');
    }
    
    await salon.save();
    
    // Handle social links if provided
    if (socialLinks) {
      const parsedLinks = typeof socialLinks === 'string' 
        ? JSON.parse(socialLinks) 
        : socialLinks;
      
      // Update each social link
      for (const [platform, url] of Object.entries(parsedLinks)) {
        // Find existing link or create new one
        let link = await SocialLinks.findOne({
          where: { 
            salonId: salon.id,
            platform
          }
        });
        
        if (link) {
          link.url = url;
          await link.save();
        } else if (url) {
          await SocialLinks.create({
            platform,
            url,
            salonId: salon.id
          });
        }
      }
    }
    
    // Return updated salon info
    const updatedSalon = await Salon.findOne();
    
    // Get updated business hours
    const businessHours = await BusinessHours.findAll({
      where: { salonId: salon.id },
      order: [['day_of_week', 'ASC']]
    });
    
    // Get updated social links
    const updatedSocialLinks = await SocialLinks.findAll({
      where: { salonId: salon.id }
    });
    
    // Format social links as an object
    const formattedSocialLinks = {};
    updatedSocialLinks.forEach(link => {
      formattedSocialLinks[link.platform] = link.url;
    });
    
    res.status(200).json({
      ...updatedSalon.toJSON(),
      businessHours,
      socialLinks: formattedSocialLinks
    });
  } catch (error) {
    console.error('Error updating salon info:', error);
    res.status(500).json({ message: 'Error updating salon information' });
  }
};

// Update business hours - FIXED to update both BusinessHours table and JSON
exports.updateBusinessHours = async (req, res) => {
  try {
    const hours = req.body;
    console.log('updateBusinessHours called with:', JSON.stringify(hours, null, 2));
    
    let business_hours;
    if (hours.business_hours && Array.isArray(hours.business_hours)) {
      // Admin controller format
      business_hours = hours.business_hours;
      console.log('Using business_hours from request body object');
    } else if (Array.isArray(hours)) {
      // Regular controller format
      business_hours = hours;
      console.log('Using hours array directly from request body');
    } else {
      return res.status(400).json({ message: 'Invalid hours format. Array of 7 days required.' });
    }
    
    if (!Array.isArray(business_hours) || business_hours.length !== 7) {
      return res.status(400).json({ message: 'Invalid hours format. Array of 7 days required.' });
    }
    
    // Find the salon
    const salon = await Salon.findOne();
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon information not found' });
    }
    
    console.log('Found salon id:', salon.id);
    
    // Update or create each business hour in the BusinessHours table
    for (const hour of business_hours) {
      console.log(\`Updating day \${hour.day_of_week} (is_open: \${hour.is_open})\`);
      
      // Try to find existing record first
      let existingHour = await BusinessHours.findOne({
        where: { 
          salonId: salon.id,
          day_of_week: hour.day_of_week
        }
      });
      
      if (existingHour) {
        // Update existing record
        existingHour.is_open = hour.is_open;
        existingHour.open_time = hour.open_time;
        existingHour.close_time = hour.close_time;
        await existingHour.save();
        console.log(\`Updated existing record for day \${hour.day_of_week}\`);
      } else {
        // Create new record
        await BusinessHours.create({
          salonId: salon.id,
          day_of_week: hour.day_of_week,
          is_open: hour.is_open,
          open_time: hour.open_time,
          close_time: hour.close_time
        });
        console.log(\`Created new record for day \${hour.day_of_week}\`);
      }
    }
    
    // Also update the business_hours JSON field in the Salon table for compatibility
    salon.business_hours = business_hours;
    await salon.save();
    console.log('Updated business_hours JSON field in Salon table');
    
    // Get updated business hours
    const updatedHours = await BusinessHours.findAll({
      where: { salonId: salon.id },
      order: [['day_of_week', 'ASC']]
    });
    
    console.log(\`Returning \${updatedHours.length} updated business hours\`);
    
    res.status(200).json({ business_hours: updatedHours });
  } catch (error) {
    console.error('Error updating business hours:', error);
    res.status(500).json({ message: 'Error updating business hours' });
  }
};
`;

// Create backup of the original file if it exists
if (fs.existsSync(salonControllerPath)) {
  const backupPath = salonControllerPath + '.original';
  fs.copyFileSync(salonControllerPath, backupPath);
  console.log(`Original controller backed up to: ${backupPath}`);
}

// Write the fixed controller
fs.writeFileSync(salonControllerPath, fixedSalonController);
console.log(`Fixed controller written to: ${salonControllerPath}`);

console.log('\nTo complete the fix:');
console.log('1. Run the SQL script to update the database: node update_business_hours.sql');
console.log('2. Restart your backend server');
console.log('\nThe fix includes:');
console.log('- Improved handling of business hours in the API responses');
console.log('- Fixed business hours update to update both table and JSON field');
console.log('- Added more detailed logging to help diagnose issues'); 