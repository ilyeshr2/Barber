const { User, Appointment, Service, Barber } = require('../../models');
const { Op } = require('sequelize');

exports.getAllClients = async (req, res) => {
    try {
        const clients = await User.findAll({
            where: { role: 'customer' },
            attributes: { exclude: ['password_hash'] },
            order: [['first_name', 'ASC'], ['last_name', 'ASC']]
        });
        res.json(clients);
    } catch (error) {
        console.error('Error in getAllClients:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getClientById = async (req, res) => {
    try {
        const client = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password_hash'] }
        });
        
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        res.json(client);
    } catch (error) {
        console.error('Error in getClientById:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getClientAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.findAll({
            where: {
                user_id: req.params.id
            },
            include: [
                {
                    model: Service,
                    attributes: ['id', 'name', 'duration', 'price']
                },
                {
                    model: Barber,
                    attributes: ['id', 'name']
                }
            ],
            order: [['appointment_date', 'DESC']]
        });
        
        res.json(appointments);
    } catch (error) {
        console.error('Error in getClientAppointments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createClient = async (req, res) => {
    try {
        const { first_name, last_name, email, telephone, date_of_birth, gender } = req.body;

        // Check if phone number already exists
        const existingClient = await User.findOne({
            where: {
                telephone
            }
        });

        if (existingClient) {
            return res.status(400).json({ message: 'A client with this phone number already exists' });
        }

        // Generate a random password for admin-created accounts
        const tempPassword = Math.random().toString(36).slice(-8);
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(tempPassword, salt);

        const client = await User.create({
            first_name,
            last_name,
            email,
            telephone,
            date_of_birth,
            gender,
            password_hash: hashedPassword,
            role: 'customer'
        });

        // Return client without password
        const createdClient = await User.findByPk(client.id, {
            attributes: { exclude: ['password_hash'] }
        });

        res.status(201).json({
            ...createdClient.toJSON(),
            tempPassword // Include temporary password in response
        });
    } catch (error) {
        console.error('Error in createClient:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateClient = async (req, res) => {
    try {
        const { first_name, last_name, email, telephone, date_of_birth, gender } = req.body;

        const client = await User.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Check if new phone number is already used by another client
        if (telephone && telephone !== client.telephone) {
            const existingClient = await User.findOne({
                where: {
                    telephone,
                    id: { [Op.ne]: req.params.id }
                }
            });

            if (existingClient) {
                return res.status(400).json({ message: 'A client with this phone number already exists' });
            }
        }

        // Update fields
        if (first_name) client.first_name = first_name;
        if (last_name) client.last_name = last_name;
        if (email) client.email = email;
        if (telephone) client.telephone = telephone;
        if (date_of_birth) client.date_of_birth = date_of_birth;
        if (gender) client.gender = gender;

        await client.save();

        // Return updated client without password
        const updatedClient = await User.findByPk(client.id, {
            attributes: { exclude: ['password_hash'] }
        });
        
        res.json(updatedClient);
    } catch (error) {
        console.error('Error in updateClient:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteClient = async (req, res) => {
    try {
        const client = await User.findByPk(req.params.id);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Check if client has any appointments
        const appointments = await Appointment.findAll({
            where: {
                user_id: req.params.id,
                appointment_date: {
                    [Op.gte]: new Date()
                }
            }
        });

        if (appointments.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete client with upcoming appointments. Please cancel all appointments first.' 
            });
        }

        await client.destroy();
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error in deleteClient:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 