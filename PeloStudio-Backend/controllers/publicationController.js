const { Publication } = require('../models');

// Helper function to handle image URLs
const addFullUrlToImages = (publications, req) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  return publications.map(pub => {
    const data = pub.toJSON();
    
    // Add full URL to image paths if they're relative
    if (data.image_url && data.image_url.startsWith('/uploads/')) {
      data.image_url = `${baseUrl}${data.image_url}`;
    }
    
    if (data.author_image && data.author_image.startsWith('/uploads/')) {
      data.author_image = `${baseUrl}${data.author_image}`;
    }
    
    return data;
  });
};

// Get all publications for public access
exports.getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.findAll({
      order: [['created_at', 'DESC']]
    });
    
    // Transform images to have full URLs
    const publicationsWithFullUrls = addFullUrlToImages(publications, req);
    
    res.status(200).json(publicationsWithFullUrls);
  } catch (error) {
    console.error('Error fetching publications:', error);
    res.status(500).json({ message: 'Server error while fetching publications' });
  }
}; 