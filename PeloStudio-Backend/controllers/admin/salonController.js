const { Salon } = require('../../models');
const cloudinary = require('../../config/cloudinary');

exports.updateSalonInfo = async (req, res) => {
    try {
        const { name, address, phone, email, description } = req.body;
        let salon = await Salon.findOne();

        // If no salon info exists, create it
        if (!salon) {
            salon = await Salon.create({
                name,
                address,
                phone,
                email,
                description
            });
        } else {
            // Update existing salon info
            if (name) salon.name = name;
            if (address) salon.address = address;
            if (phone) salon.phone = phone;
            if (email) salon.email = email;
            if (description) salon.description = description;
        }

        // Handle logo upload
        if (req.files && req.files.logo) {
            const result = await cloudinary.uploader.upload(req.files.logo[0].path);
            salon.logo_url = result.secure_url;
        }

        // Handle salon image upload
        if (req.files && req.files.image) {
            const result = await cloudinary.uploader.upload(req.files.image[0].path);
            salon.image_url = result.secure_url;
        }

        await salon.save();
        res.json(salon);
    } catch (error) {
        console.error('Error in updateSalonInfo:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateBusinessHours = async (req, res) => {
    try {
        const { businessHours } = req.body;
        let salon = await Salon.findOne();

        if (!salon) {
            return res.status(404).json({ message: 'Salon information not found' });
        }

        // Validate business hours format
        if (!Array.isArray(businessHours) || businessHours.length !== 7) {
            return res.status(400).json({ 
                message: 'Business hours must be an array with 7 days' 
            });
        }

        // Validate each day's format
        const isValidHours = businessHours.every(day => {
            return day.isOpen !== undefined &&
                   (!day.isOpen || (day.openTime && day.closeTime));
        });

        if (!isValidHours) {
            return res.status(400).json({ 
                message: 'Invalid business hours format' 
            });
        }

        salon.businessHours = businessHours;
        await salon.save();
        
        res.json(salon);
    } catch (error) {
        console.error('Error in updateBusinessHours:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 