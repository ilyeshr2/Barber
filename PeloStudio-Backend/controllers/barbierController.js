// controllers/barbierController.js
const { Barbier, Service } = require('../models');

// Get all barbers
exports.getAllBarbers = async (req, res) => {
  try {
    const barbers = await Barbier.findAll();
    res.status(200).json(barbers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get barber by ID
exports.getBarberById = async (req, res) => {
    try {
      const barber = await Barbier.findByPk(req.params.id, {
        include: [Service]  // Don't use 'as: "Services"' unless you defined it that way
      });
      
      if (!barber) {
        return res.status(404).json({ message: 'Barbier non trouvé' });
      }
      
      res.status(200).json(barber);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };

// Get barber services
exports.getBarberServices = async (req, res) => {
    try {
      const services = await Service.findAll({
        where: { BarberId: req.params.id }  // This is already correct based on your DB
      });
      
      res.status(200).json(services);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };