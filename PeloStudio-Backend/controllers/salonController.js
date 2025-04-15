// controllers/salonController.js - NEW FILE
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
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Write file to disk
  fs.writeFileSync(filePath, file.buffer);
  
  // Return relative path for database storage
  return `/uploads/${folderName}/${fileName}`;
};

// Get salon information
exports.getSalonInfo = async (req, res) => {
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

    res.json(salon);
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

// Update business hours
exports.updateBusinessHours = async (req, res) => {
  try {
    const hours = req.body;
    
    if (!Array.isArray(hours) || hours.length !== 7) {
      return res.status(400).json({ message: 'Invalid hours format. Array of 7 days required.' });
    }
    
    // Find the salon
    const salon = await Salon.findOne();
    
    if (!salon) {
      return res.status(404).json({ message: 'Salon information not found' });
    }
    
    // Update or create each business hour
    for (const hour of hours) {
      await BusinessHours.upsert({
        day_of_week: hour.day_of_week,
        is_open: hour.is_open,
        open_time: hour.open_time,
        close_time: hour.close_time,
        salonId: salon.id
      });
    }
    
    // Get updated business hours
    const updatedHours = await BusinessHours.findAll({
      where: { salonId: salon.id },
      order: [['day_of_week', 'ASC']]
    });
    
    res.status(200).json(updatedHours);
  } catch (error) {
    console.error('Error updating business hours:', error);
    res.status(500).json({ message: 'Error updating business hours' });
  }
};