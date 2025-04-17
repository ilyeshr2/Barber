const { Service, Barber, ServiceBarber, sequelize } = require('../../models');

exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll({
            include: [{ model: Barber, attributes: ['id', 'name'], through: { attributes: [] } }],
            order: [['name', 'ASC']]
        });
        
        // Map to frontend format
        const mappedServices = services.map(service => ({
            id: service.id,
            nom: service.name,
            description: service.description,
            duree: service.duration,
            prix: service.price,
            BarberId: service.barber_id, // Keep for backward compatibility
            barbiers: service.Barbers ? service.Barbers.map(barber => ({ id: barber.id, nom: barber.name })) : [],
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
            include: [{ model: Barber, attributes: ['id', 'name'], through: { attributes: [] } }]
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
            BarberId: service.barber_id, // Keep for backward compatibility
            barbiers: service.Barbers ? service.Barbers.map(barber => ({ id: barber.id, nom: barber.name })) : [],
            is_active: service.is_active
        };
        
        res.status(200).json(mappedService);
    } catch (error) {
        console.error('Error fetching service:', error);
        res.status(500).json({ message: 'Error fetching service' });
    }
};

exports.createService = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Map frontend format to database format
        const { nom, description, duree, prix, BarberId, barberIds = [], is_active = true } = req.body;
        
        if (!nom || !duree || !prix) {
            return res.status(400).json({ 
                message: 'Name, duration, and price are required' 
            });
        }
        
        // Ensure we have at least one barber
        if (!BarberId && (!barberIds || barberIds.length === 0)) {
            return res.status(400).json({ 
                message: 'At least one barber must be assigned to the service' 
            });
        }
        
        // For backward compatibility, use BarberId if provided
        const primaryBarberId = BarberId || barberIds[0];
        
        // Create the service
        const service = await Service.create({
            name: nom,
            description,
            duration: duree,
            price: prix,
            barber_id: primaryBarberId,
            is_active
        }, { transaction });
        
        // Create associations with all barbers
        const barberIdsToUse = barberIds.length > 0 ? barberIds : [BarberId];
        
        await Promise.all(barberIdsToUse.map(barberId => 
            ServiceBarber.create({
                service_id: service.id,
                barber_id: barberId
            }, { transaction })
        ));
        
        await transaction.commit();
        
        // Get the complete service with barbers
        const completeService = await Service.findByPk(service.id, {
            include: [{ model: Barber, attributes: ['id', 'name'], through: { attributes: [] } }]
        });
        
        // Map to frontend format
        const mappedService = {
            id: completeService.id,
            nom: completeService.name,
            description: completeService.description,
            duree: completeService.duration,
            prix: completeService.price,
            BarberId: completeService.barber_id,
            barbiers: completeService.Barbers ? completeService.Barbers.map(barber => ({ id: barber.id, nom: barber.name })) : [],
            is_active: completeService.is_active
        };
        
        res.status(201).json(mappedService);
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating service:', error);
        res.status(500).json({ message: 'Error creating service' });
    }
};

exports.updateService = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        // Map frontend format to database format
        const { nom, description, duree, prix, BarberId, barberIds = [], is_active } = req.body;
        
        const service = await Service.findByPk(req.params.id);
        
        if (!service) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Service not found' });
        }
        
        // Update fields
        if (nom) service.name = nom;
        if (description !== undefined) service.description = description;
        if (duree) service.duration = duree;
        if (prix) service.price = prix;
        
        // For backward compatibility, use BarberId if provided
        if (BarberId) service.barber_id = BarberId;
        // If barberIds is provided and not empty, update the primary barber to be the first one
        else if (barberIds && barberIds.length > 0) service.barber_id = barberIds[0];
        
        if (is_active !== undefined) service.is_active = is_active;
        
        await service.save({ transaction });
        
        // If barberIds is provided, update the many-to-many relationships
        if (barberIds && barberIds.length > 0) {
            // Remove all existing associations
            await ServiceBarber.destroy({ 
                where: { service_id: service.id },
                transaction
            });
            
            // Create new associations
            await Promise.all(barberIds.map(barberId => 
                ServiceBarber.create({
                    service_id: service.id,
                    barber_id: barberId
                }, { transaction })
            ));
        }
        // If only BarberId is provided, use it as the only barber
        else if (BarberId) {
            // Remove all existing associations
            await ServiceBarber.destroy({ 
                where: { service_id: service.id },
                transaction
            });
            
            // Create new association
            await ServiceBarber.create({
                service_id: service.id,
                barber_id: BarberId
            }, { transaction });
        }
        
        await transaction.commit();
        
        // Get the complete service with barbers
        const completeService = await Service.findByPk(service.id, {
            include: [{ model: Barber, attributes: ['id', 'name'], through: { attributes: [] } }]
        });
        
        // Map to frontend format
        const mappedService = {
            id: completeService.id,
            nom: completeService.name,
            description: completeService.description,
            duree: completeService.duration,
            prix: completeService.price,
            BarberId: completeService.barber_id,
            barbiers: completeService.Barbers ? completeService.Barbers.map(barber => ({ id: barber.id, nom: barber.name })) : [],
            is_active: completeService.is_active
        };
        
        res.status(200).json(mappedService);
    } catch (error) {
        await transaction.rollback();
        console.error('Error updating service:', error);
        res.status(500).json({ message: 'Error updating service' });
    }
};

exports.deleteService = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const { id } = req.params;
        
        const service = await Service.findByPk(id);
        if (!service) {
            await transaction.rollback();
            return res.status(404).json({ message: 'Service not found' });
        }
        
        // Delete all associations first
        await ServiceBarber.destroy({ 
            where: { service_id: id },
            transaction
        });
        
        // Delete the service
        await service.destroy({ transaction });
        
        await transaction.commit();
        
        res.status(200).json({ message: 'Service deleted successfully' });
    } catch (error) {
        await transaction.rollback();
        console.error('Error deleting service:', error);
        res.status(500).json({ message: 'Error deleting service' });
    }
}; 