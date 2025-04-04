// controllers/rendezVousController.js
const { RendezVous, Barbier, Service, Utilisateur, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get user appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await RendezVous.findAll({
      where: { 
        UtilisateurId: req.userId,
        // Only get confirmed appointments
        statut: 'confirmé'
      },
      include: [
        { model: Barbier, attributes: ['id', 'nom', 'photoUrl'] },
        { model: Service, attributes: ['id', 'nom', 'prix'] }
      ],
      order: [['date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { barbierId, serviceId, date } = req.body;
    
    if (!barbierId || !serviceId || !date) {
      return res.status(400).json({ message: 'Barber ID, service ID, and date are required' });
    }
    
    // Get service to check duration
    const service = await Service.findByPk(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const appointmentDate = new Date(date);
    const appointmentEndTime = new Date(appointmentDate.getTime() + (service.duree * 60 * 1000));
    
    console.log(`Checking availability for ${appointmentDate.toISOString()} to ${appointmentEndTime.toISOString()}`);
    
    // Check if date and time are available
    const conflictingAppointments = await RendezVous.findAll({
      where: {
        BarbierId: barbierId,
        statut: 'confirmé',
        [Op.or]: [
          // New appointment starts during an existing appointment
          {
            date: {
              [Op.lt]: appointmentEndTime,
              [Op.gte]: appointmentDate
            }
          },
          // New appointment ends during an existing appointment
          {
            '$Service.duree$': {
              [Op.ne]: null
            },
            [Op.and]: [
              sequelize.literal(`"date" <= '${appointmentDate.toISOString()}'`),
              sequelize.literal(`"date" + interval '1 minute' * "Service"."duree" > '${appointmentDate.toISOString()}'`)
            ]
          }
        ]
      },
      include: [
        { model: Service, attributes: ['id', 'duree'] }
      ]
    });
    
    if (conflictingAppointments.length > 0) {
      console.log(`Found ${conflictingAppointments.length} conflicting appointments`);
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    // Create the appointment
    const appointment = await RendezVous.create({
      date: appointmentDate,
      UtilisateurId: req.userId,
      BarbierId: barbierId,
      ServiceId: serviceId,
      statut: 'confirmé'
    });
    
    // Get full appointment data with associations
    const fullAppointment = await RendezVous.findByPk(appointment.id, {
      include: [
        { model: Barbier, attributes: ['id', 'nom', 'photoUrl'] },
        { model: Service, attributes: ['id', 'nom', 'prix', 'duree'] }
      ]
    });
    
    res.status(201).json(fullAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
};

// Cancel an appointment
exports.cancelAppointment = async (req, res) => {
  try {
    const appointment = await RendezVous.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.UtilisateurId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    
    appointment.statut = 'annulé';
    await appointment.save();
    
    res.status(200).json({ message: 'Appointment successfully cancelled' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while cancelling appointment' });
  }
};

// Check if a time slot is available for a barber
exports.checkAvailability = async (req, res) => {
  try {
    const { barbierId, date } = req.query;
    
    if (!barbierId || !date) {
      return res.status(400).json({ message: 'Barber ID and date are required' });
    }
    
    // Parse the date
    const appointmentDate = new Date(date);
    
    // Calculate the start and end of the day
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Find all appointments for this barber on this day
    const appointments = await RendezVous.findAll({
      where: {
        BarbierId: barbierId,
        date: {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay
        },
        statut: 'confirmé'
      },
      attributes: ['id', 'date', 'ServiceId'],
      include: [
        { 
          model: Service, 
          attributes: ['id', 'nom', 'duree'] 
        }
      ]
    });
    
    console.log(`Found ${appointments.length} appointments for barber ${barbierId} on ${appointmentDate}`);
    
    // Create an array of unavailable time slots with detailed info
    const unavailableSlots = appointments.map(appointment => {
      const appointmentTime = new Date(appointment.date);
      const duration = appointment.Service ? appointment.Service.duree : 30; // Default to 30 minutes
      const endTime = new Date(appointmentTime.getTime() + (duration * 60 * 1000));
      
      return {
        id: appointment.id,
        startTime: appointmentTime,
        endTime: endTime,
        serviceName: appointment.Service ? appointment.Service.nom : 'Unknown Service',
        duration: duration
      };
    });
    
    // Calculate available time slots based on business hours and unavailable slots
    // Business hours from 9 AM to 6 PM with 30 minute intervals
    const availableSlots = [];
    const startHour = 9;
    const endHour = 18;
    
    // Generate all possible time slots
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute of [0, 30]) {
        // Skip the 18:30 slot (after closing)
        if (hour === endHour && minute === 30) continue;
        
        const slotTime = new Date(startOfDay);
        slotTime.setHours(hour, minute, 0, 0);
        
        availableSlots.push({
          time: slotTime.toISOString(),
          displayTime: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          available: true
        });
      }
    }
    
    // Mark slots as unavailable based on appointments
    // Note: This is just for providing full information to the frontend
    // The actual filtering will happen in the frontend based on service duration
    availableSlots.forEach(slot => {
      const slotTime = new Date(slot.time).getTime();
      
      slot.available = !unavailableSlots.some(unavailable => {
        const unavailableStart = unavailable.startTime.getTime();
        const unavailableEnd = unavailable.endTime.getTime();
        
        // Check if this slot starts during an unavailable period
        return (slotTime >= unavailableStart && slotTime < unavailableEnd);
      });
    });
    
    res.status(200).json({
      barbierId,
      date: appointmentDate.toISOString(),
      businessHours: {
        start: `${startHour}:00`,
        end: `${endHour}:00`
      },
      availableSlots,
      unavailableSlots: unavailableSlots.map(slot => ({
        id: slot.id,
        startTime: slot.startTime.toISOString(),
        endTime: slot.endTime.toISOString(),
        serviceName: slot.serviceName,
        duration: slot.duration
      }))
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({ message: 'Server error while checking availability' });
  }
};

// Get upcoming appointments (for admin)
exports.getUpcomingAppointments = async (req, res) => {
  try {
    // Only accessible to admin users (if you implement admin functionality)
    const now = new Date();
    
    const appointments = await RendezVous.findAll({
      where: {
        date: {
          [Op.gte]: now
        },
        statut: 'confirmé'
      },
      include: [
        { model: Utilisateur, attributes: ['id', 'nom', 'prenom', 'telephone'] },
        { model: Barbier, attributes: ['id', 'nom'] },
        { model: Service, attributes: ['id', 'nom', 'prix', 'duree'] }
      ],
      order: [['date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete an appointment (mark as finished)
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await RendezVous.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    appointment.statut = 'terminé';
    await appointment.save();
    
    res.status(200).json({ message: 'Appointment marked as completed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};