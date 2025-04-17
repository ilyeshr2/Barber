// controllers/salonController.js - FIXED VERSION
const { Salon, BusinessHours, SocialLinks, sequelize } = require('../models');
const path = require('path');
const fs = require('fs');
const { QueryTypes } = require('sequelize');

// Helper function to handle file uploads
const handleFileUpload = (file, folderName) => {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../uploads', folderName);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Generate unique filename
  const fileExt = path.extname(file.originalname);
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Write file to disk
  fs.writeFileSync(filePath, file.buffer);
  
  // Return relative path for database storage
  return `/uploads/${folderName}/${fileName}`;
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
    
    console.log('updateSalonInfo called with request body:', JSON.stringify(req.body, null, 2));
    console.log('Files received:', req.files);
    
    // Find the salon record (there should be only one)
    let salon = await Salon.findOne();
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon information not found' });
    }
    
    console.log('Current salon data from DB:', salon.toJSON());
    
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
    
    try {
      await salon.save();
      console.log('Salon data saving result: Success');
    } catch (saveError) {
      console.error('Error saving salon data:', saveError);
      console.log('Salon data saving result: Failed');
    }
    
    console.log('Salon data saved successfully:', salon.toJSON());
    
    // DIRECT SQL UPDATE for social links if provided - as a fallback approach
    if (socialLinks) {
      console.log('Updating social links via direct SQL...');
      
      // Parse links if needed
      const parsedLinks = typeof socialLinks === 'string' 
        ? JSON.parse(socialLinks) 
        : socialLinks;
      
      console.log('Social links to update:', parsedLinks);
      
      // Process each platform
      for (const [platform, url] of Object.entries(parsedLinks)) {
        try {
          // First check if the record exists
          const checkQuery = `
            SELECT id FROM "SocialLinks" 
            WHERE salon_id = :salonId AND platform = :platform
          `;
          
          const existingRecords = await sequelize.query(checkQuery, {
            replacements: { 
              salonId: salon.id,
              platform
            },
            type: QueryTypes.SELECT
          });
          
          console.log(`Check for existing ${platform} link result:`, existingRecords);
          
          if (existingRecords && existingRecords.length > 0) {
            // Record exists, update it
            console.log(`Existing record found for ${platform}, updating...`);
            
            const updateQuery = `
              UPDATE "SocialLinks" 
              SET url = :url, updated_at = NOW() 
              WHERE id = :id
            `;
            
            const updateResult = await sequelize.query(updateQuery, {
              replacements: { 
                url,
                id: existingRecords[0].id
              },
              type: QueryTypes.UPDATE
            });
            
            console.log(`Direct SQL update for ${platform} result:`, updateResult);
          } else {
            // Record doesn't exist, insert it
            console.log(`No existing record for ${platform}, inserting new one...`);
            
            const insertQuery = `
              INSERT INTO "SocialLinks" (platform, url, salon_id, created_at, updated_at)
              VALUES (:platform, :url, :salonId, NOW(), NOW())
            `;
            
            const insertResult = await sequelize.query(insertQuery, {
              replacements: { 
                platform,
                url,
                salonId: salon.id
              },
              type: QueryTypes.INSERT
            });
            
            console.log(`Direct SQL insert for ${platform} result:`, insertResult);
          }
        } catch (sqlError) {
          console.error(`Error updating social link for ${platform}:`, sqlError);
        }
      }
    }
    
    // Return updated salon info
    const updatedSalon = await Salon.findOne();
    
    // Get updated business hours
    const businessHours = await BusinessHours.findAll({
      where: { salon_id: salon.id },
      order: [['day_of_week', 'ASC']]
    });
    
    // Get updated social links with direct query to ensure latest data
    const updatedSocialLinks = await sequelize.query(
      'SELECT * FROM "SocialLinks" WHERE salon_id = :salonId',
      {
        replacements: { salonId: salon.id },
        type: QueryTypes.SELECT
      }
    );
    
    console.log('Retrieved updated social links:', JSON.stringify(updatedSocialLinks, null, 2));
    
    // Format social links as an object
    const formattedSocialLinks = {};
    updatedSocialLinks.forEach(link => {
      formattedSocialLinks[link.platform] = link.url;
    });
    
    console.log('Formatted social links for response:', JSON.stringify(formattedSocialLinks, null, 2));
    
    // Create response
    const response = {
      ...updatedSalon.toJSON(),
      businessHours,
      socialLinks: formattedSocialLinks
    };
    
    console.log('Full response data with social links:', JSON.stringify({
      id: response.id,
      name: response.name,
      socialLinks: formattedSocialLinks
    }, null, 2));
    
    // Let's make absolutely sure the social links are included in the response
    if (!response.socialLinks || Object.keys(response.socialLinks).length === 0) {
      console.log('IMPORTANT: Social links missing from response, adding them explicitly');
      response.socialLinks = formattedSocialLinks;
    }
    
    // Return the response with explicitly added social links
    res.status(200).json({
      ...response,
      socialLinks: formattedSocialLinks // Add again to make absolutely sure
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
      console.log(`Updating day ${hour.day_of_week} (is_open: ${hour.is_open})`);
      
      // Try to find existing record first
      let existingHour = await BusinessHours.findOne({
        where: { 
          salon_id: salon.id,
          day_of_week: hour.day_of_week
        }
      });
      
      if (existingHour) {
        // Update existing record
        existingHour.is_open = hour.is_open;
        existingHour.open_time = hour.open_time;
        existingHour.close_time = hour.close_time;
        await existingHour.save();
        console.log(`Updated existing record for day ${hour.day_of_week}`);
      } else {
        // Create new record
        await BusinessHours.create({
          salon_id: salon.id,
          day_of_week: hour.day_of_week,
          is_open: hour.is_open,
          open_time: hour.open_time,
          close_time: hour.close_time
        });
        console.log(`Created new record for day ${hour.day_of_week}`);
      }
    }
    
    // Also update the business_hours JSON field in the Salon table for compatibility
    salon.business_hours = business_hours;
    await salon.save();
    console.log('Updated business_hours JSON field in Salon table');
    
    // Get updated business hours
    const updatedHours = await BusinessHours.findAll({
      where: { salon_id: salon.id },
      order: [['day_of_week', 'ASC']]
    });
    
    console.log(`Returning ${updatedHours.length} updated business hours`);
    
    res.status(200).json({ business_hours: updatedHours });
  } catch (error) {
    console.error('Error updating business hours:', error);
    res.status(500).json({ message: 'Error updating business hours' });
  }
};
