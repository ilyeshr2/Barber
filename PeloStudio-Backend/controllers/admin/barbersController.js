const { Barber, Service, Appointment } = require('../../models');
const { Op } = require('sequelize');
const cloudinary = require('../../config/cloudinary');
const fs = require('fs');

exports.getAllBarbers = async (req, res) => {
    try {
        const barbers = await Barber.findAll({
            include: [{
                model: Service,
                attributes: ['id', 'name', 'price', 'duration']
            }]
        });
        
        res.status(200).json(barbers);
    } catch (error) {
        console.error('Error fetching barbers:', error);
        res.status(500).json({ message: 'Server error while fetching barbers' });
    }
};

exports.getBarberById = async (req, res) => {
    try {
        const barber = await Barber.findByPk(req.params.id, {
            include: [{
                model: Service,
                attributes: ['id', 'name', 'price', 'duration', 'description']
            }]
        });
        
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        
        res.status(200).json(barber);
    } catch (error) {
        console.error('Error fetching barber:', error);
        res.status(500).json({ message: 'Server error while fetching barber' });
    }
};

exports.createBarber = async (req, res) => {
    try {
        const { name, rating = 5.0, review_count = 0, salon_id = 1 } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        
        let photoUrl = '/images/default-barber.jpg'; // Default image
        
        // Upload image to cloudinary if provided
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'barbers'
            });
            
            photoUrl = result.secure_url;
            
            // Remove the temporary file
            fs.unlinkSync(req.file.path);
        }
        
        const barber = await Barber.create({
            name,
            photo_url: photoUrl,
            rating: parseFloat(rating),
            review_count: parseInt(review_count, 10),
            salon_id: parseInt(salon_id, 10),
            is_active: true
        });
        
        res.status(201).json(barber);
    } catch (error) {
        console.error('Error creating barber:', error);
        
        // If file was uploaded but there was an error, cleanup
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ message: 'Server error while creating barber' });
    }
};

exports.updateBarber = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, rating, review_count, is_active } = req.body;
        
        const barber = await Barber.findByPk(id);
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        
        // Handle photo update if file is provided
        if (req.file) {
            // If there's an existing photo that's not the default, delete it from cloudinary
            if (barber.photo_url && barber.photo_url.includes('cloudinary')) {
                const publicId = barber.photo_url.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`barbers/${publicId}`);
            }
            
            // Upload new photo
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'barbers'
            });
            
            barber.photo_url = result.secure_url;
            
            // Remove the temporary file
            fs.unlinkSync(req.file.path);
        }
        
        // Update other fields if provided
        if (name) barber.name = name;
        if (rating !== undefined) barber.rating = parseFloat(rating);
        if (review_count !== undefined) barber.review_count = parseInt(review_count, 10);
        if (is_active !== undefined) barber.is_active = is_active === 'true' || is_active === true;
        
        await barber.save();
        
        res.status(200).json(barber);
    } catch (error) {
        console.error('Error updating barber:', error);
        
        // If file was uploaded but there was an error, cleanup
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        
        res.status(500).json({ message: 'Server error while updating barber' });
    }
};

exports.deleteBarber = async (req, res) => {
    try {
        const { id } = req.params;
        
        const barber = await Barber.findByPk(id);
        if (!barber) {
            return res.status(404).json({ message: 'Barber not found' });
        }
        
        // Check for future appointments
        const upcomingAppointments = await Appointment.count({
            where: {
                barber_id: id,
                appointment_date: {
                    [Op.gt]: new Date()
                },
                status: 'confirmed'
            }
        });
        
        if (upcomingAppointments > 0) {
            return res.status(400).json({
                message: 'Cannot delete barber with upcoming appointments. Please cancel or reassign appointments first.'
            });
        }
        
        // Delete photo from cloudinary if it's not the default
        if (barber.photo_url && barber.photo_url.includes('cloudinary')) {
            const publicId = barber.photo_url.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`barbers/${publicId}`);
        }
        
        await barber.destroy();
        
        res.status(200).json({ message: 'Barber successfully deleted' });
    } catch (error) {
        console.error('Error deleting barber:', error);
        res.status(500).json({ message: 'Server error while deleting barber' });
    }
}; 