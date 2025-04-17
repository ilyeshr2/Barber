// check-barber-services.js
const { Barber, Service, ServiceBarber } = require('./models');

async function checkBarberServices() {
  try {
    console.log('=== BARBER SERVICES DIAGNOSTIC ===');
    
    // 1. Check ServiceBarbers table
    const serviceBarbers = await ServiceBarber.findAll();
    console.log(`Found ${serviceBarbers.length} entries in the ServiceBarbers table:`);
    
    for (const sb of serviceBarbers) {
      console.log(`  - Service ID: ${sb.service_id}, Barber ID: ${sb.barber_id}`);
    }
    
    // 2. Check specific barber by ID
    const barberId = 6; // testing barber ID 6 which was reported to have issues
    console.log(`\nChecking services for Barber ID ${barberId}:`);
    
    // Get barber by ID with services
    const barber = await Barber.findByPk(barberId, {
      include: [{ 
        model: Service, 
        through: { attributes: [] },
        attributes: ['id', 'name', 'description', 'duration', 'price', 'is_active']
      }]
    });
    
    if (!barber) {
      console.log(`  Barber with ID ${barberId} not found!`);
    } else {
      console.log(`  Barber: ${barber.name} (ID: ${barber.id})`);
      
      if (barber.Services && barber.Services.length > 0) {
        console.log(`  Found ${barber.Services.length} services for this barber:`);
        for (const service of barber.Services) {
          console.log(`    - Service ID: ${service.id}, Name: ${service.name}, Price: ${service.price}`);
        }
      } else {
        console.log('  No services found for this barber.');
        
        // Check if there are entries in the junction table for this barber
        const junctionEntries = await ServiceBarber.findAll({
          where: { barber_id: barberId }
        });
        
        if (junctionEntries.length > 0) {
          console.log(`  Found ${junctionEntries.length} junction table entries for this barber:`);
          for (const entry of junctionEntries) {
            console.log(`    - Service ID: ${entry.service_id}`);
          }
        } else {
          console.log('  No junction table entries found for this barber.');
        }
      }
      
      // 3. Check via direct SQL query
      const [results] = await barber.sequelize.query(`
        SELECT s.id, s.name, s.price, s.duration
        FROM "Services" s
        JOIN "ServiceBarbers" sb ON s.id = sb.service_id
        WHERE sb.barber_id = ${barberId}
      `);
      
      console.log(`\n  SQL Query results: found ${results.length} services:`);
      for (const row of results) {
        console.log(`    - Service ID: ${row.id}, Name: ${row.name}, Price: ${row.price}`);
      }
    }
    
  } catch (error) {
    console.error('Error running diagnostics:', error);
  } finally {
    process.exit(0);
  }
}

checkBarberServices(); 