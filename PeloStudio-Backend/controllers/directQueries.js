const { sequelize } = require('../models');

// Get barber services using direct SQL
exports.getBarberServices = async (req, res) => {
  try {
    const barberId = req.params.id;
    console.log(`Fetching services for barber ID: ${barberId} using direct SQL`);
    
    // Use direct SQL query to get services for this barber
    // queryType is not needed and raw is set to true to get plain objects
    const query = `
      SELECT 
        s.id, 
        s.name, 
        s.description, 
        s.duration, 
        s.price, 
        s.is_active, 
        s.created_at, 
        s.updated_at
      FROM 
        "Services" s
      JOIN 
        "ServiceBarbers" sb ON s.id = sb.service_id
      WHERE 
        sb.barber_id = ${barberId}
    `;
    
    const [services] = await sequelize.query(query, { raw: true });
    
    console.log(`Found ${services ? services.length : 0} services for barber ID: ${barberId}`);
    
    if (services && services.length > 0) {
      services.forEach(service => {
        console.log(`  - Service ID: ${service.id}, Name: ${service.name}, Price: ${service.price}`);
      });
    }
    
    // Send empty array if no services found
    res.status(200).json(services || []);
  } catch (error) {
    console.error('Error in direct query for barber services:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 