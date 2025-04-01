// controllers/rendezVousController.js
const { RendezVous, Barbier, Service, Utilisateur } = require('../models');

// Get user appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await RendezVous.findAll({
      where: { UtilisateurId: req.userId },
      include: [
        { model: Barbier, attributes: ['id', 'nom', 'photoUrl'] },
        { model: Service, attributes: ['id', 'nom', 'prix'] }
      ],
      order: [['date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { barbierId, serviceId, date } = req.body;
    
    // Check if date and time are available - Using BarbierId (with capital I) as per the database
    const existingAppointment = await RendezVous.findOne({
      where: {
        BarbierId: barbierId,  // Note: using BarbierId here
        date: new Date(date),
        statut: 'confirmé'
      }
    });
    
    if (existingAppointment) {
      return res.status(400).json({ message: 'Ce créneau horaire est déjà réservé' });
    }
    
    // Create the appointment - Using BarbierId (with capital I) as per the database
    const appointment = await RendezVous.create({
      date: new Date(date),
      UtilisateurId: req.userId,
      BarbierId: barbierId,  // Note: using BarbierId here
      ServiceId: serviceId
    });
    
    // Get full appointment data with associations
    const fullAppointment = await RendezVous.findByPk(appointment.id, {
      include: [
        { model: Barbier, attributes: ['id', 'nom', 'photoUrl'] },
        { model: Service, attributes: ['id', 'nom', 'prix'] }
      ]
    });
    
    res.status(201).json(fullAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création du rendez-vous' });
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await RendezVous.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Rendez-vous non trouvé' });
    }
    
    if (appointment.UtilisateurId !== req.userId) {
      return res.status(403).json({ message: 'Non autorisé' });
    }
    
    appointment.statut = 'annulé';
    await appointment.save();
    
    res.status(200).json({ message: 'Rendez-vous annulé avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};