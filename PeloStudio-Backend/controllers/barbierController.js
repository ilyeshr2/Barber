// controllers/barbierController.js
const { Barber, Service, ServiceBarber, Appointment } = require('../models');
const { Op } = require('sequelize');

// Get all barbers
exports.getAllBarbers = async (req, res) => {
  try {
    const barbers = await Barber.findAll();
    
    // Transform field names from English to French for the front-end
    const transformedBarbers = barbers.map(barber => ({
      id: barber.id,
      nom: barber.name,
      photoUrl: barber.photo_url,
      note: barber.rating,
      nombreAvis: barber.review_count,
      salonId: barber.salon_id,
      createdAt: barber.created_at,
      updatedAt: barber.updated_at
    }));
    
    res.status(200).json(transformedBarbers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get barber by ID
exports.getBarberById = async (req, res) => {
  try {
    const barber = await Barber.findByPk(req.params.id, {
      include: [{ model: Service, through: { attributes: [] } }]
    });
    
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    // Transform field names from English to French for the front-end
    const transformedBarber = {
      id: barber.id,
      nom: barber.name,
      photoUrl: barber.photo_url,
      note: barber.rating,
      nombreAvis: barber.review_count,
      salonId: barber.salon_id,
      createdAt: barber.created_at,
      updatedAt: barber.updated_at,
      Services: barber.Services // Keep Service as is since it's an association
    };
    
    res.status(200).json(transformedBarber);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get barber services - Updated to use the many-to-many relationship
exports.getBarberServices = async (req, res) => {
  try {
    console.log(`Fetching services for barber ID: ${req.params.id}`);
    
    // Get the barber with their services through the many-to-many relationship
    const barber = await Barber.findByPk(req.params.id, {
      include: [{ 
        model: Service, 
        through: { attributes: [] },  // Don't include junction table data
        attributes: ['id', 'name', 'description', 'duration', 'price', 'is_active', 'created_at', 'updated_at']
      }]
    });
    
    if (!barber) {
      console.log(`Barber with ID ${req.params.id} not found`);
      return res.status(404).json({ message: 'Barber not found' });
    }
    
    console.log(`Found ${barber.Services ? barber.Services.length : 0} services for barber ID: ${req.params.id}`);
    
    // Extract and return the services
    res.status(200).json(barber.Services || []);
  } catch (error) {
    console.error('Error fetching barber services:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new barber
exports.createBarber = async (req, res) => {
  try {
    const { nom, photoUrl, note = 5.0, nombreAvis = 0, salonId = 1 } = req.body;

    if (!nom) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Transform field names from French to English for the database
    const barber = await Barber.create({
      name: nom,
      photo_url: photoUrl || '/images/default-barber.jpg',
      rating: note,
      review_count: nombreAvis,
      salon_id: salonId
    });

    // Transform back to French field names for the response
    const transformedBarber = {
      id: barber.id,
      nom: barber.name,
      photoUrl: barber.photo_url,
      note: barber.rating,
      nombreAvis: barber.review_count,
      salonId: barber.salon_id,
      createdAt: barber.created_at,
      updatedAt: barber.updated_at
    };

    res.status(201).json(transformedBarber);
  } catch (error) {
    console.error('Error creating barber:', error);
    res.status(500).json({ message: 'Server error while creating barber' });
  }
};

// Update a barber
exports.updateBarber = async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, photoUrl, note, nombreAvis } = req.body;

    const barber = await Barber.findByPk(id);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Update only provided fields, transforming from French to English
    const updateData = {};
    if (nom) updateData.name = nom;
    if (photoUrl) updateData.photo_url = photoUrl;
    if (note !== undefined) updateData.rating = note;
    if (nombreAvis !== undefined) updateData.review_count = nombreAvis;

    await barber.update(updateData);

    // Transform back to French field names for the response
    const transformedBarber = {
      id: barber.id,
      nom: barber.name,
      photoUrl: barber.photo_url,
      note: barber.rating,
      nombreAvis: barber.review_count,
      salonId: barber.salon_id,
      createdAt: barber.created_at,
      updatedAt: barber.updated_at
    };

    res.status(200).json(transformedBarber);
  } catch (error) {
    console.error('Error updating barber:', error);
    res.status(500).json({ message: 'Server error while updating barber' });
  }
};

// Delete a barber
exports.deleteBarber = async (req, res) => {
  try {
    const { id } = req.params;

    const barber = await Barber.findByPk(id);
    if (!barber) {
      return res.status(404).json({ message: 'Barber not found' });
    }

    // Check if barber has any upcoming appointments
    // Use direct query instead of association method
    const appointmentCount = await Appointment.count({
      where: {
        barber_id: id,
        appointment_date: {
          [Op.gt]: new Date()
        },
        status: 'confirmed'
      }
    });

    if (appointmentCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete barber with upcoming appointments. Please cancel or reassign appointments first.' 
      });
    }

    await barber.destroy();
    res.status(200).json({ message: 'Barber successfully deleted' });
  } catch (error) {
    console.error('Error deleting barber:', error);
    res.status(500).json({ message: 'Server error while deleting barber' });
  }
};