// controllers/appointmentsController.js
const { Appointment, User, Barber, Service, sequelize } = require('../models');
const { Op } = require('sequelize');

// Get today's appointments
exports.getTodayAppointments = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const appointments = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        },
        status: 'confirmed'
      },
      include: [
        { 
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'telephone']
        },
        { 
          model: Barber,
          attributes: ['id', 'name', 'photo_url']
        },
        { 
          model: Service,
          attributes: ['id', 'name', 'price', 'duration']
        }
      ],
      order: [['appointment_date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching today\'s appointments:', error);
    res.status(500).json({ message: 'Server error while fetching today\'s appointments' });
  }
};

// Get user appointments
exports.getUserAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { 
        user_id: req.userId,
        status: 'confirmed'
      },
      include: [
        { model: Barber, attributes: ['id', 'name', 'photo_url'] },
        { model: Service, attributes: ['id', 'name', 'price', 'duration'] }
      ],
      order: [['appointment_date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  try {
    const { barber_id, service_id, appointment_date } = req.body;
    
    if (!barber_id || !service_id || !appointment_date) {
      return res.status(400).json({ message: 'Barber ID, service ID, and date are required' });
    }
    
    // Get service to check duration
    const service = await Service.findByPk(service_id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    const appointmentDate = new Date(appointment_date);
    const appointmentEndTime = new Date(appointmentDate.getTime() + (service.duration * 60 * 1000));
    
    // Check if date and time are available
    const conflictingAppointments = await Appointment.findAll({
      where: {
        barber_id,
        status: 'confirmed',
        [Op.or]: [
          // New appointment starts during an existing appointment
          {
            appointment_date: {
              [Op.lt]: appointmentEndTime,
              [Op.gte]: appointmentDate
            }
          },
          // New appointment ends during an existing appointment
          {
            '$Service.duration$': {
              [Op.ne]: null
            },
            [Op.and]: [
              sequelize.literal(`"appointment_date" <= '${appointmentDate.toISOString()}'`),
              sequelize.literal(`"appointment_date" + interval '1 minute' * "Service"."duration" > '${appointmentDate.toISOString()}'`)
            ]
          }
        ]
      },
      include: [
        { model: Service, attributes: ['id', 'duration'] }
      ]
    });
    
    if (conflictingAppointments.length > 0) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }
    
    // Create the appointment
    const appointment = await Appointment.create({
      appointment_date: appointmentDate,
      user_id: req.userId,
      barber_id,
      service_id,
      status: 'confirmed'
    });
    
    // Get full appointment data with associations
    const fullAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Barber, attributes: ['id', 'name', 'photo_url'] },
        { model: Service, attributes: ['id', 'name', 'price', 'duration'] }
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
    const appointment = await Appointment.findByPk(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    if (appointment.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to cancel this appointment' });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.status(200).json({ message: 'Appointment successfully cancelled' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
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
    const appointments = await Appointment.findAll({
      where: {
        barber_id: barbierId,
        appointment_date: {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay
        },
        status: 'confirmed'
      },
      attributes: ['id', 'appointment_date', 'service_id'],
      include: [
        { 
          model: Service, 
          attributes: ['id', 'name', 'duration'] 
        }
      ]
    });
    
    // Create an array of unavailable time slots with detailed info
    const unavailableSlots = appointments.map(appointment => {
      const appointmentTime = new Date(appointment.appointment_date);
      const duration = appointment.Service ? appointment.Service.duration : 30; // Default to 30 minutes
      const endTime = new Date(appointmentTime.getTime() + (duration * 60 * 1000));
      
      return {
        id: appointment.id,
        startTime: appointmentTime,
        endTime: endTime,
        serviceName: appointment.Service ? appointment.Service.name : 'Unknown Service',
        duration: duration
      };
    });
    
    // Generate all possible time slots
    const availableSlots = [];
    const startHour = 9;
    const endHour = 18;
    
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
    const now = new Date();
    
    const appointments = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.gte]: now
        },
        status: 'confirmed'
      },
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name', 'telephone'] },
        { model: Barber, attributes: ['id', 'name'] },
        { model: Service, attributes: ['id', 'name', 'price', 'duration'] }
      ],
      order: [['appointment_date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete an appointment (mark as finished)
exports.completeAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findByPk(id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    
    appointment.status = 'completed';
    await appointment.save();
    
    res.status(200).json({ message: 'Appointment marked as completed' });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all appointments (admin)
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { 
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'telephone']
        },
        { 
          model: Barber,
          attributes: ['id', 'name', 'photo_url']
        },
        { 
          model: Service,
          attributes: ['id', 'name', 'price', 'duration']
        }
      ],
      order: [['appointment_date', 'DESC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching all appointments:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// Get upcoming appointments (admin)
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const now = new Date();
    
    const appointments = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.gt]: now
        },
        status: 'confirmed'
      },
      include: [
        { 
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'telephone']
        },
        { 
          model: Barber,
          attributes: ['id', 'name', 'photo_url']
        },
        { 
          model: Service,
          attributes: ['id', 'name', 'price', 'duration']
        }
      ],
      order: [['appointment_date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error);
    res.status(500).json({ message: 'Server error while fetching upcoming appointments' });
  }
};

// Get appointments by date (admin)
exports.getAppointmentsByDate = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);
    
    const nextDay = new Date(searchDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const appointments = await Appointment.findAll({
      where: {
        appointment_date: {
          [Op.gte]: searchDate,
          [Op.lt]: nextDay
        }
      },
      include: [
        { 
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'telephone']
        },
        { 
          model: Barber,
          attributes: ['id', 'name', 'photo_url']
        },
        { 
          model: Service,
          attributes: ['id', 'name', 'price', 'duration']
        }
      ],
      order: [['appointment_date', 'ASC']]
    });
    
    res.status(200).json(appointments);
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

// Update appointment status (admin)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required (confirmed, cancelled, or completed)' });
    }

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { 
          model: User,
          attributes: ['id', 'first_name', 'last_name', 'telephone']
        },
        { 
          model: Barber,
          attributes: ['id', 'name', 'photo_url']
        },
        { 
          model: Service,
          attributes: ['id', 'name', 'price', 'duration']
        }
      ]
    });

    res.status(200).json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ message: 'Server error while updating appointment status' });
  }
};

// Delete an appointment (admin)
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if the appointment is in the future
    const now = new Date();
    const appointmentDate = new Date(appointment.appointment_date);
    if (appointmentDate < now) {
      return res.status(400).json({ message: 'Cannot delete past appointments' });
    }

    await appointment.destroy();
    res.status(200).json({ message: 'Appointment successfully deleted' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ message: 'Server error while deleting appointment' });
  }
};