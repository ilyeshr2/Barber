const { Barber, Service, Appointment, FileStorage } = require('../../models');
const { Op } = require('sequelize');
const fs = require('fs');
const path = require('path');

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
        
        let photoUrl = '/uploads/barbers/default-barber.jpg'; // Default image
        
        // Upload image to local storage if provided
        if (req.file) {
            // Create uploads directory if it doesn't exist
            const uploadDir = path.join(__dirname, '../../uploads/barbers');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            // Generate unique filename
            const fileName = `${Date.now()}-${path.basename(req.file.originalname)}`;
            const filePath = path.join(uploadDir, fileName);
            
            // Move file from temp location to barbers directory
            fs.renameSync(req.file.path, filePath);
            
            // Store file metadata in database
            const fileData = await FileStorage.create({
                original_name: req.file.originalname,
                file_path: `/uploads/barbers/${fileName}`,
                file_size: req.file.size,
                mime_type: req.file.mimetype,
                category: 'barbers',
                upload_date: new Date()
            });
            
            photoUrl = fileData.file_path;
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
            // Create uploads directory if it doesn't exist
            const uploadDir = path.join(__dirname, '../../uploads/barbers');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            // Generate unique filename
            const fileName = `${Date.now()}-${path.basename(req.file.originalname)}`;
            const filePath = path.join(uploadDir, fileName);
            
            // Move file from temp location to barbers directory
            fs.renameSync(req.file.path, filePath);
            
            // Store file metadata in database
            const fileData = await FileStorage.create({
                original_name: req.file.originalname,
                file_path: `/uploads/barbers/${fileName}`,
                file_size: req.file.size,
                mime_type: req.file.mimetype,
                category: 'barbers',
                upload_date: new Date()
            });
            
            // Delete old photo file if it's not the default
            if (barber.photo_url && !barber.photo_url.includes('default-barber') && fs.existsSync(path.join(__dirname, '../../', barber.photo_url))) {
                fs.unlinkSync(path.join(__dirname, '../../', barber.photo_url));
            }
            
            barber.photo_url = fileData.file_path;
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
        
        // Delete photo file if it's not the default
        if (barber.photo_url && !barber.photo_url.includes('default-barber')) {
            const photoPath = path.join(__dirname, '../../', barber.photo_url);
            if (fs.existsSync(photoPath)) {
                fs.unlinkSync(photoPath);
            }
        }
        
        await barber.destroy();
        
        res.status(200).json({ message: 'Barber successfully deleted' });
    } catch (error) {
        console.error('Error deleting barber:', error);
        res.status(500).json({ message: 'Server error while deleting barber' });
    }
}; 