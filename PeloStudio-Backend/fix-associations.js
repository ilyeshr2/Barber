// fix-associations.js
const db = require('./models');
const { Op } = require('sequelize');

async function fixAssociations() {
  try {
    console.log('Starting association fixes...');
    
    // Create a combined route handler for barber services
    // This will bypass the association and use a direct query
    const fixedGetBarberServices = async (req, res) => {
      try {
        const barberId = req.params.id;
        console.log(`Fetching services for barber ID: ${barberId} using direct SQL`);
        
        // Get services for this barber using direct SQL instead of associations
        const [services] = await db.sequelize.query(`
          SELECT s.id, s.name, s.description, s.duration, s.price, s.is_active, 
                 s.created_at, s.updated_at
          FROM "Services" s
          JOIN "ServiceBarbers" sb ON s.id = sb.service_id
          WHERE sb.barber_id = :barberId
        `, {
          replacements: { barberId },
          type: db.sequelize.QueryTypes.SELECT
        });
        
        if (!services || services.length === 0) {
          console.log(`No services found for barber ID: ${barberId}`);
          return res.status(200).json([]);
        }
        
        console.log(`Found ${services.length} services for barber ID: ${barberId}`);
        res.status(200).json(services);
      } catch (error) {
        console.error('Error fetching barber services:', error);
        res.status(500).json({ message: 'Server error' });
      }
    };
    
    // Replace the existing handler in the controllers/barbierController.js file
    const barbierController = require('./controllers/barbierController');
    barbierController.getBarberServices = fixedGetBarberServices;
    
    console.log('Route handler for barber services has been replaced with a fixed version.');
    console.log('Please restart the server for the changes to take effect.');
    
    // Check current junction table entries
    const serviceBarbers = await db.ServiceBarber.findAll();
    console.log(`Found ${serviceBarbers.length} entries in the ServiceBarbers table:`);
    
    for (const sb of serviceBarbers) {
      console.log(`  - Service ID: ${sb.service_id}, Barber ID: ${sb.barber_id}`);
    }
    
  } catch (error) {
    console.error('Error fixing associations:', error);
  } finally {
    process.exit(0);
  }
}

fixAssociations(); 