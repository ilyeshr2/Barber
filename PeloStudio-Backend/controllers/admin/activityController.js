const { Activity, User } = require('../../models');

// Get the most recent activities
exports.getRecentActivities = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 5;
        
        const activities = await Activity.findAll({
            order: [['created_at', 'DESC']],
            limit,
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'first_name', 'last_name']
                }
            ]
        });
        
        res.json(activities);
    } catch (error) {
        console.error('Error in getRecentActivities:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Log a new activity
exports.logActivity = async (activityData) => {
    try {
        const activity = await Activity.create(activityData);
        return activity;
    } catch (error) {
        console.error('Error logging activity:', error);
        // Don't throw error to prevent disrupting main operations
        return null;
    }
};

// Helper function to log appointment activities
exports.logAppointmentActivity = async (appointment, action, userId = null) => {
    let title, icon, description;
    
    switch (action) {
        case 'created':
            title = 'New appointment created';
            icon = 'bi bi-calendar-plus';
            break;
        case 'updated':
            title = 'Appointment updated';
            icon = 'bi bi-calendar-check';
            break;
        case 'status_updated':
            title = `Appointment status changed to ${appointment.status}`;
            icon = appointment.status === 'cancelled' ? 'bi bi-calendar-x' : 
                  appointment.status === 'completed' ? 'bi bi-calendar-check' : 'bi bi-calendar';
            break;
        case 'deleted':
            title = 'Appointment deleted';
            icon = 'bi bi-calendar-x';
            break;
        default:
            title = 'Appointment activity';
            icon = 'bi bi-calendar';
    }
    
    return this.logActivity({
        type: 'appointment',
        action,
        entity_id: appointment.id,
        user_id: userId,
        title,
        icon,
        description,
        metadata: {
            appointment_date: appointment.appointment_date,
            status: appointment.status,
            user_id: appointment.user_id,
            barber_id: appointment.barber_id,
            service_id: appointment.service_id
        }
    });
};

// Helper function to log client activities
exports.logClientActivity = async (client, action, userId = null) => {
    let title, icon, description;
    
    switch (action) {
        case 'created':
            title = `New client registered: ${client.first_name} ${client.last_name}`;
            icon = 'bi bi-person-plus';
            break;
        case 'updated':
            title = `Client updated: ${client.first_name} ${client.last_name}`;
            icon = 'bi bi-person';
            break;
        case 'deleted':
            title = `Client deleted: ${client.first_name} ${client.last_name}`;
            icon = 'bi bi-person-x';
            break;
        default:
            title = `Client activity: ${client.first_name} ${client.last_name}`;
            icon = 'bi bi-person';
    }
    
    return this.logActivity({
        type: 'client',
        action,
        entity_id: client.id,
        user_id: userId,
        title,
        icon,
        description,
        metadata: {
            name: `${client.first_name} ${client.last_name}`,
            email: client.email,
            telephone: client.telephone
        }
    });
};

// Helper function to log service activities
exports.logServiceActivity = async (service, action, userId = null) => {
    let title, icon, description;
    
    switch (action) {
        case 'created':
            title = `New service added: ${service.name}`;
            icon = 'bi bi-scissors';
            break;
        case 'updated':
            title = `Service updated: ${service.name}`;
            icon = 'bi bi-scissors';
            break;
        case 'deleted':
            title = `Service deleted: ${service.name}`;
            icon = 'bi bi-scissors';
            break;
        default:
            title = `Service activity: ${service.name}`;
            icon = 'bi bi-scissors';
    }
    
    return this.logActivity({
        type: 'service',
        action,
        entity_id: service.id,
        user_id: userId,
        title,
        icon,
        description,
        metadata: {
            name: service.name,
            price: service.price,
            duration: service.duration,
            barber_id: service.barber_id
        }
    });
}; 