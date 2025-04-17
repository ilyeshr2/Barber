const { User, Appointment, Service, Barber } = require('../../models');
const { Op } = require('sequelize');
const activityController = require('./activityController');

// Debug log for User model
console.log('User model details:', {
    attributes: Object.keys(User.rawAttributes),
    tableName: User.tableName,
    modelName: User.name
});

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
        console.log('Create client request body:', JSON.stringify(req.body, null, 2));
        const { first_name, last_name, email, telephone, date_of_birth, gender, password } = req.body;

        // Additional validation for required fields
        if (!first_name || !last_name || !telephone || !date_of_birth || !gender) {
            console.error('Missing required fields');
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Check if phone number already exists
        const existingClient = await User.findOne({
            where: {
                telephone
            }
        });

        if (existingClient) {
            return res.status(400).json({ message: 'A client with this phone number already exists' });
        }

        // Use password from frontend if provided, otherwise generate a random one
        let clientPassword = password;
        if (!clientPassword) {
            clientPassword = Math.random().toString(36).slice(-8);
        }
        
        console.log('Using password:', clientPassword ? '[PASSWORD PROVIDED]' : 'generated password');
        
        const bcrypt = require('bcrypt');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(clientPassword, salt);

        // Log the data we're trying to create (without sensitive info)
        console.log('Creating user with data:', {
            first_name,
            last_name,
            email: email || null,
            telephone,
            date_of_birth,
            gender,
            role: 'customer'
        });

        try {
            const client = await User.create({
                first_name,
                last_name,
                email: email || null, // Handle empty email strings
                telephone,
                date_of_birth,
                gender,
                password_hash: hashedPassword,
                role: 'customer'
            });

            console.log('User created successfully:', client.id);

            // Log activity for the new client
            await activityController.logClientActivity(client, 'created', req.user?.id);

            // Return client without password
            const createdClient = await User.findByPk(client.id, {
                attributes: { exclude: ['password_hash'] }
            });

            const responseData = createdClient.toJSON();
            
            // Only include temporary password if we generated one
            if (!password) {
                responseData.tempPassword = clientPassword;
            }

            res.status(201).json(responseData);
        } catch (innerError) {
            console.error('Error creating user record:', innerError);
            throw innerError;
        }
    } catch (error) {
        console.error('Error in createClient - Full details:', error);
        console.error('Error stack:', error.stack);
        
        if (error.name === 'SequelizeValidationError') {
            // Log validation errors
            const validationErrors = error.errors.map(err => ({
                field: err.path,
                type: err.type,
                message: err.message
            }));
            console.error('Validation errors:', JSON.stringify(validationErrors));
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: validationErrors 
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            console.error('Unique constraint error:', JSON.stringify(error.errors));
            return res.status(400).json({ 
                message: 'A user with this information already exists', 
                field: error.errors[0].path 
            });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
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

        // Log activity for client update
        await activityController.logClientActivity(client, 'updated', req.user?.id);

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

        // Store client data for the activity log
        const clientData = {
            id: client.id,
            first_name: client.first_name,
            last_name: client.last_name,
            email: client.email,
            telephone: client.telephone
        };

        await client.destroy();

        // Log activity for client deletion
        await activityController.logClientActivity(clientData, 'deleted', req.user?.id);

        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        console.error('Error in deleteClient:', error);
        res.status(500).json({ message: 'Server error' });
    }
}; 