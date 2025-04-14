const { Appointment, User, Barber, Service } = require('../../models');
const { Op } = require('sequelize');

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
                    attributes: ['id', 'name']
                },
                {
                    model: Service,
                    attributes: ['id', 'name', 'duration', 'price']
                }
            ],
            order: [['appointment_date', 'ASC']]
        });
        res.json(appointments);
    } catch (error) {
        console.error('Error in getAllAppointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

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
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'telephone']
                },
                {
                    model: Barber,
                    attributes: ['id', 'name']
                },
                {
                    model: Service,
                    attributes: ['id', 'name', 'duration', 'price']
                }
            ],
            order: [['appointment_date', 'ASC']]
        });

        res.json(appointments);
    } catch (error) {
        console.error('Error in getTodayAppointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUpcomingAppointments = async (req, res) => {
    try {
        const now = new Date();
        const appointments = await Appointment.findAll({
            where: {
                appointment_date: {
                    [Op.gt]: now
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'telephone']
                },
                {
                    model: Barber,
                    attributes: ['id', 'name']
                },
                {
                    model: Service,
                    attributes: ['id', 'name', 'duration', 'price']
                }
            ],
            order: [['appointment_date', 'ASC']]
        });
        res.json(appointments);
    } catch (error) {
        console.error('Error in getUpcomingAppointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAppointmentsByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ message: 'Date parameter is required' });
        }

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);

        const appointments = await Appointment.findAll({
            where: {
                appointment_date: {
                    [Op.gte]: startDate,
                    [Op.lt]: endDate
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'telephone']
                },
                {
                    model: Barber,
                    attributes: ['id', 'name']
                },
                {
                    model: Service,
                    attributes: ['id', 'name', 'duration', 'price']
                }
            ],
            order: [['appointment_date', 'ASC']]
        });
        res.json(appointments);
    } catch (error) {
        console.error('Error in getAppointmentsByDate:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.create(req.body);
        const appointmentWithDetails = await Appointment.findByPk(appointment.id, {
            include: [
                {
                    model: User,
                    attributes: ['id', 'first_name', 'last_name', 'telephone']
                },
                {
                    model: Barber,
                    attributes: ['id', 'name']
                },
                {
                    model: Service,
                    attributes: ['id', 'name', 'duration', 'price']
                }
            ]
        });
        res.status(201).json(appointmentWithDetails);
    } catch (error) {
        console.error('Error in createAppointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

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
                    attributes: ['id', 'name']
                },
                {
                    model: Service,
                    attributes: ['id', 'name', 'duration', 'price']
                }
            ]
        });
        res.json(updatedAppointment);
    } catch (error) {
        console.error('Error in updateAppointmentStatus:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findByPk(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        await appointment.destroy();
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Error in deleteAppointment:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 