// controllers/servicesController.js
const { Service } = require('../models');

// Get services by barber ID
exports.getServicesByBarberId = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { barber_id: req.params.id }
    });
    
    // Transform to French field names for frontend
    const transformedServices = services.map(service => ({
      id: service.id,
      nom: service.name,
      description: service.description,
      duree: service.duration,
      prix: service.price,
      BarberId: service.barber_id,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    }));
    
    res.status(200).json(transformedServices);
  } catch (error) {
    console.error('Error fetching barber services:', error);
    res.status(500).json({ message: 'Error fetching barber services' });
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    
    // Transform to French field names for frontend
    const transformedServices = services.map(service => ({
      id: service.id,
      nom: service.name,
      description: service.description,
      duree: service.duration,
      prix: service.price,
      BarberId: service.barber_id,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    }));
    
    res.status(200).json(transformedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Error fetching services' });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Transform to French field names for frontend
    const transformedService = {
      id: service.id,
      nom: service.name,
      description: service.description,
      duree: service.duration,
      prix: service.price,
      BarberId: service.barber_id,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };
    
    res.status(200).json(transformedService);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Error fetching service' });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    // Transform from French to English field names
    const { nom, description, duree, prix, BarberId } = req.body;
    
    const service = await Service.create({
      name: nom,
      description,
      duration: duree,
      price: prix,
      barber_id: BarberId
    });
    
    // Transform back to French field names for response
    const transformedService = {
      id: service.id,
      nom: service.name,
      description: service.description,
      duree: service.duration,
      prix: service.price,
      BarberId: service.barber_id,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };
    
    res.status(201).json(transformedService);
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Error creating service' });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    // Transform from French to English field names
    const { nom, description, duree, prix, BarberId } = req.body;
    
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Update fields
    const updateData = {};
    if (nom) updateData.name = nom;
    if (description !== undefined) updateData.description = description;
    if (duree) updateData.duration = duree;
    if (prix) updateData.price = prix;
    if (BarberId) updateData.barber_id = BarberId;
    
    await service.update(updateData);
    
    // Transform back to French field names for response
    const transformedService = {
      id: service.id,
      nom: service.name,
      description: service.description,
      duree: service.duration,
      prix: service.price,
      BarberId: service.barber_id,
      createdAt: service.created_at,
      updatedAt: service.updated_at
    };
    
    res.status(200).json(transformedService);
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Error updating service' });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    await service.destroy();
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ message: 'Error deleting service' });
  }
};