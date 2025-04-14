const { Publication } = require('../../models');
const cloudinary = require('../../config/cloudinary');

exports.getAllPublications = async (req, res) => {
    try {
        const publications = await Publication.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(publications);
    } catch (error) {
        console.error('Error in getAllPublications:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicationById = async (req, res) => {
    try {
        const publication = await Publication.findByPk(req.params.id);
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }
        res.json(publication);
    } catch (error) {
        console.error('Error in getPublicationById:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createPublication = async (req, res) => {
    try {
        const { title, description, authorName } = req.body;
        let imageUrl = '';
        let authorImageUrl = '';

        // Handle main image upload
        if (req.files && req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image[0].path);
            imageUrl = result.secure_url;
        }

        // Handle author image upload
        if (req.files && req.files.authorImage) {
            const result = await cloudinary.uploader.upload(req.files.authorImage[0].path);
            authorImageUrl = result.secure_url;
        }

        const publication = await Publication.create({
            title,
            description,
            imageUrl,
            authorName,
            authorImageUrl,
            likes: 0,
            reactions: ''
        });

        res.status(201).json(publication);
    } catch (error) {
        console.error('Error in createPublication:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePublication = async (req, res) => {
    try {
        const { title, description, authorName } = req.body;
        
        const publication = await Publication.findByPk(req.params.id);
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        // Handle main image upload
        if (req.files && req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image[0].path);
            publication.imageUrl = result.secure_url;
        }

        // Handle author image upload
        if (req.files && req.files.authorImage) {
            const result = await cloudinary.uploader.upload(req.files.authorImage[0].path);
            publication.authorImageUrl = result.secure_url;
        }

        // Update text fields
        if (title) publication.title = title;
        if (description) publication.description = description;
        if (authorName) publication.authorName = authorName;

        await publication.save();
        res.json(publication);
    } catch (error) {
        console.error('Error in updatePublication:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deletePublication = async (req, res) => {
    try {
        const publication = await Publication.findByPk(req.params.id);
        if (!publication) {
            return res.status(404).json({ message: 'Publication not found' });
        }

        await publication.destroy();
        res.json({ message: 'Publication deleted successfully' });
    } catch (error) {
        console.error('Error in deletePublication:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 