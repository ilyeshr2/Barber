const { Publication, FileStorage } = require('../../models');
const fs = require('fs');
const path = require('path');

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

exports.getPublicationById = async (req, res) => {
    try {
        const publication = await Publication.findByPk(req.params.id);
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }
        
        // Transform images to have full URLs
        const publicationWithFullUrls = addFullUrlToImages([publication], req)[0];
        
        res.status(200).json(publicationWithFullUrls);
    } catch (error) {
        console.error('Error fetching publication:', error);
        res.status(500).json({ message: 'Server error while fetching publication' });
    }
};

exports.createPublication = async (req, res) => {
    try {
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        // Safely extract values from req.body with fallbacks
        const title = req.body && req.body.title ? req.body.title : '';
        const description = req.body && req.body.description ? req.body.description : '';
        const author_name = req.body && req.body.author_name ? req.body.author_name : 'Anonymous';
        
        const files = req.files || {};
        
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/publications');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Initialize image URLs
        let imageUrl = '';
        let authorImageUrl = '';
        
        // Handle main image upload
        if (files.image && files.image[0]) {
            const imageFile = files.image[0];
            const imageFileName = `${Date.now()}-post-${path.basename(imageFile.originalname)}`;
            const imageFilePath = path.join(uploadDir, imageFileName);
            
            // Move file from temp location to publications directory
            fs.renameSync(imageFile.path, imageFilePath);
            
            // Store file metadata in database
            const imageFileData = await FileStorage.create({
                original_name: imageFile.originalname,
                file_path: `/uploads/publications/${imageFileName}`,
                file_size: imageFile.size,
                mime_type: imageFile.mimetype,
                category: 'publications',
                upload_date: new Date()
            });
            
            imageUrl = imageFileData.file_path;
        } else {
            return res.status(400).json({ message: 'Image is required for a publication' });
        }
        
        // Handle author image upload
        if (files.authorImage && files.authorImage[0]) {
            const authorFile = files.authorImage[0];
            const authorFileName = `${Date.now()}-author-${path.basename(authorFile.originalname)}`;
            const authorFilePath = path.join(uploadDir, authorFileName);
            
            // Move file from temp location to publications directory
            fs.renameSync(authorFile.path, authorFilePath);
            
            // Store file metadata in database
            const authorFileData = await FileStorage.create({
                original_name: authorFile.originalname,
                file_path: `/uploads/publications/${authorFileName}`,
                file_size: authorFile.size,
                mime_type: authorFile.mimetype,
                category: 'publications',
                upload_date: new Date()
            });
            
            authorImageUrl = authorFileData.file_path;
        } else {
            // Use a default author image if none provided
            authorImageUrl = '/uploads/publications/default-author.jpg';
        }
        
        // Create the publication
        const publication = await Publication.create({
            title: title,
            description: description,
            image_url: imageUrl,
            author_name: author_name,
            author_image: authorImageUrl,
            likes: 0,
            reactions: ''
        });
        
        // Return the publication with full URLs for images
        const publicationWithFullUrls = addFullUrlToImages([publication], req)[0];
        
        res.status(201).json(publicationWithFullUrls);
    } catch (error) {
        console.error('Error creating publication:', error);
        
        // Clean up uploaded files if there was an error
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        
        res.status(500).json({ message: 'Server error while creating publication' });
    }
};

exports.updatePublication = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Safely extract values from req.body
        const title = req.body && req.body.title !== undefined ? req.body.title : undefined;
        const description = req.body && req.body.description !== undefined ? req.body.description : undefined;
        const author_name = req.body && req.body.author_name !== undefined ? req.body.author_name : undefined;
        
        const files = req.files || {};
        
        const publication = await Publication.findByPk(id);
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }
        
        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads/publications');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // Handle main image upload
        if (files.image && files.image[0]) {
            const imageFile = files.image[0];
            const imageFileName = `${Date.now()}-post-${path.basename(imageFile.originalname)}`;
            const imageFilePath = path.join(uploadDir, imageFileName);
            
            // Move file from temp location to publications directory
            fs.renameSync(imageFile.path, imageFilePath);
            
            // Store file metadata in database
            const imageFileData = await FileStorage.create({
                original_name: imageFile.originalname,
                file_path: `/uploads/publications/${imageFileName}`,
                file_size: imageFile.size,
                mime_type: imageFile.mimetype,
                category: 'publications',
                upload_date: new Date()
            });
            
            // Delete old image if it exists
            if (publication.image_url && fs.existsSync(path.join(__dirname, '../../', publication.image_url))) {
                fs.unlinkSync(path.join(__dirname, '../../', publication.image_url));
            }
            
            publication.image_url = imageFileData.file_path;
        }
        
        // Handle author image upload
        if (files.authorImage && files.authorImage[0]) {
            const authorFile = files.authorImage[0];
            const authorFileName = `${Date.now()}-author-${path.basename(authorFile.originalname)}`;
            const authorFilePath = path.join(uploadDir, authorFileName);
            
            // Move file from temp location to publications directory
            fs.renameSync(authorFile.path, authorFilePath);
            
            // Store file metadata in database
            const authorFileData = await FileStorage.create({
                original_name: authorFile.originalname,
                file_path: `/uploads/publications/${authorFileName}`,
                file_size: authorFile.size,
                mime_type: authorFile.mimetype,
                category: 'publications',
                upload_date: new Date()
            });
            
            // Delete old author image if it exists and is not the default
            if (publication.author_image && !publication.author_image.includes('default-author') && 
                fs.existsSync(path.join(__dirname, '../../', publication.author_image))) {
                fs.unlinkSync(path.join(__dirname, '../../', publication.author_image));
            }
            
            publication.author_image = authorFileData.file_path;
        }
        
        // Update text fields if provided
        if (title !== undefined) publication.title = title;
        if (description !== undefined) publication.description = description;
        if (author_name !== undefined) publication.author_name = author_name;
        
        await publication.save();
        
        // Return the updated publication with full URLs for images
        const publicationWithFullUrls = addFullUrlToImages([publication], req)[0];
        
        res.status(200).json(publicationWithFullUrls);
    } catch (error) {
        console.error('Error updating publication:', error);
        
        // Clean up uploaded files if there was an error
        if (req.files) {
            Object.values(req.files).flat().forEach(file => {
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
            });
        }
        
        res.status(500).json({ message: 'Server error while updating publication' });
    }
};

exports.deletePublication = async (req, res) => {
    try {
        const { id } = req.params;
        
        const publication = await Publication.findByPk(id);
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }
        
        // Delete image files if they exist
        if (publication.image_url && fs.existsSync(path.join(__dirname, '../../', publication.image_url))) {
            fs.unlinkSync(path.join(__dirname, '../../', publication.image_url));
        }
        
        if (publication.author_image && !publication.author_image.includes('default-author') && 
            fs.existsSync(path.join(__dirname, '../../', publication.author_image))) {
            fs.unlinkSync(path.join(__dirname, '../../', publication.author_image));
        }
        
        await publication.destroy();
        
        res.status(200).json({ message: 'Publication successfully deleted' });
    } catch (error) {
        console.error('Error deleting publication:', error);
        res.status(500).json({ message: 'Server error while deleting publication' });
    }
}; 