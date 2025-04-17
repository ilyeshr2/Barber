const express = require('express');
const router = express.Router();
const salonController = require('../../controllers/salonController');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { authenticateToken, isAdmin } = require('../../middlewares/authMiddleware');

// Routes in this file are already under /api/admin/salon
// No need for auth middleware as it's already applied in adminRoutes.js

// GET /api/admin/salon - Get salon info (admin version)
router.get('/', salonController.getSalonInfo);

// The below routes are already defined in adminRoutes.js, commenting them out
// router.put('/', 
//   upload.fields([
//     { name: 'logo', maxCount: 1 },
//     { name: 'image', maxCount: 1 }
//   ]),
//   salonController.updateSalonInfo
// );

// router.put('/hours', salonController.updateBusinessHours);

// Add dedicated endpoint for updating social links
router.put('/social-links', async (req, res) => {
  try {
    console.log('Direct social links update endpoint called');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { socialLinks } = req.body;
    
    if (!socialLinks || typeof socialLinks !== 'object') {
      return res.status(400).json({ message: 'Invalid social links format' });
    }
    
    // Get the salon ID
    const { sequelize } = require('../../models');
    const { QueryTypes } = require('sequelize');
    
    // Get salon ID
    const salon = await sequelize.query(
      'SELECT id FROM "Salon" LIMIT 1',
      { type: QueryTypes.SELECT }
    );
    
    if (!salon || salon.length === 0) {
      return res.status(404).json({ message: 'Salon not found' });
    }
    
    const salonId = salon[0].id;
    console.log('Salon ID for social links update:', salonId);
    
    // Process each social link
    const updates = [];
    for (const [platform, url] of Object.entries(socialLinks)) {
      console.log(`Processing platform ${platform} with URL ${url}`);
      
      try {
        // First check if the record exists
        const existingLinks = await sequelize.query(
          'SELECT id FROM "SocialLinks" WHERE salon_id = :salonId AND platform = :platform',
          {
            replacements: { salonId, platform },
            type: QueryTypes.SELECT
          }
        );
        
        console.log(`Found ${existingLinks.length} existing links for ${platform}`);
        
        if (existingLinks.length > 0) {
          // Update existing link
          const updateResult = await sequelize.query(
            'UPDATE "SocialLinks" SET url = :url, updated_at = NOW() WHERE id = :id',
            {
              replacements: { url, id: existingLinks[0].id },
              type: QueryTypes.UPDATE
            }
          );
          
          updates.push({ platform, action: 'updated', url });
          console.log(`Updated ${platform} link to ${url}`);
        } else {
          // Create new link
          const insertResult = await sequelize.query(
            'INSERT INTO "SocialLinks" (platform, url, salon_id, created_at, updated_at) VALUES (:platform, :url, :salonId, NOW(), NOW()) RETURNING id',
            {
              replacements: { platform, url, salonId },
              type: QueryTypes.INSERT
            }
          );
          
          updates.push({ platform, action: 'created', url });
          console.log(`Created new ${platform} link with URL ${url}`);
        }
      } catch (err) {
        console.error(`Error processing ${platform}:`, err);
        updates.push({ platform, action: 'error', error: err.message });
      }
    }
    
    // Get all updated social links to return
    const updatedLinks = await sequelize.query(
      'SELECT platform, url FROM "SocialLinks" WHERE salon_id = :salonId',
      {
        replacements: { salonId },
        type: QueryTypes.SELECT
      }
    );
    
    // Format as an object for the response
    const formattedLinks = {};
    updatedLinks.forEach(link => {
      formattedLinks[link.platform] = link.url;
    });
    
    console.log('Returning formatted links:', formattedLinks);
    
    // Return success with the updates
    res.status(200).json({
      message: 'Social links updated successfully',
      updates,
      socialLinks: formattedLinks
    });
  } catch (error) {
    console.error('Error in social-links endpoint:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

module.exports = router; 