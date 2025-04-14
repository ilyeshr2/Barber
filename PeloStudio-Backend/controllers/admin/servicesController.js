const { Service, Barber } = require('../../models');

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll({
            include: [{ model: Barber, attributes: ['id', 'name'] }],
            order: [['name', 'ASC']]
        });
        
        // Map to frontend format
        const mappedServices = services.map(service => ({
            id: service.id,
            nom: service.name,
            description: service.description,
            duree: service.duration,
            prix: service.price,
            BarberId: service.barber_id,
            barbier: service.Barber ? { id: service.Barber.id, nom: service.Barber.name } : null,
            is_active: service.is_active
        }));
        
        res.status(200).json(mappedServices);
    } catch (error) {
        console.error('Error fetching services:', error);
        res.status(500).json({ message: 'Error fetching services' });
    }
};

exports.getServiceById = async (req, res) => {
    try {
        const service = await Service.findByPk(req.params.id, {
            include: [{ model: Barber, attributes: ['id', 'name'] }]
        });
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        // Map to frontend format
        const mappedService = {
            id: service.id,
            nom: service.name,
            description: service.description,
            duree: service.duration,
            prix: service.price,
            BarberId: service.barber_id,
            barbier: service.Barber ? { id: service.Barber.id, nom: service.Barber.name } : null,
            is_active: service.is_active
        };
        
        res.status(200).json(mappedService);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Error fetching service' });
    }
};

exports.createService = async (req, res) => {
    try {
        // Map frontend format to database format
        const { nom, description, duree, prix, BarberId, is_active = true } = req.body;
        
        if (!nom || !duree || !prix || !BarberId) {
            return res.status(400).json({ 
                message: 'Name, duration, price, and barber ID are required' 
            });
        }
        
        const service = await Service.create({
            name: nom,
            description,
            duration: duree,
            price: prix,
            barber_id: BarberId,
            is_active
        });
        
        // Get the complete service with barber
        const completeService = await Service.findByPk(service.id, {
            include: [{ model: Barber, attributes: ['id', 'name'] }]
        });
        
        // Map to frontend format
        const mappedService = {
            id: completeService.id,
            nom: completeService.name,
            description: completeService.description,
            duree: completeService.duration,
            prix: completeService.price,
            BarberId: completeService.barber_id,
            barbier: completeService.Barber ? { id: completeService.Barber.id, nom: completeService.Barber.name } : null,
            is_active: completeService.is_active
        };
        
        res.status(201).json(mappedService);
    } catch (error) {
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service' });
    }
};

exports.updateService = async (req, res) => {
    try {
        // Map frontend format to database format
        const { nom, description, duree, prix, BarberId, is_active } = req.body;
        
        const service = await Service.findByPk(req.params.id);
        
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        
        // Update fields
        if (nom) service.name = nom;
        if (description !== undefined) service.description = description;
        if (duree) service.duration = duree;
        if (prix) service.price = prix;
        if (BarberId) service.barber_id = BarberId;
        if (is_active !== undefined) service.is_active = is_active;
        
        await service.save();
        
        // Get the complete service with barber
        const completeService = await Service.findByPk(service.id, {
            include: [{ model: Barber, attributes: ['id', 'name'] }]
        });
        
        // Map to frontend format
        const mappedService = {
            id: completeService.id,
            nom: completeService.name,
            description: completeService.description,
            duree: completeService.duration,
            prix: completeService.price,
            BarberId: completeService.barber_id,
            barbier: completeService.Barber ? { id: completeService.Barber.id, nom: completeService.Barber.name } : null,
            is_active: completeService.is_active
        };
        
        res.status(200).json(mappedService);
    } catch (error) {
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Error updating service' });
    }
};

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