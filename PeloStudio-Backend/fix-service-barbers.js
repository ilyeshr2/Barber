const { sequelize, Service, Barber, ServiceBarber } = require('./models');

async function runDiagnostics() {
  try {
    console.log('Running diagnostics for service-barber relationships...');
    
    // 1. Get all services
    const services = await Service.findAll({
      include: [{ model: Barber, through: { attributes: [] } }]
    });
    
    console.log(`Found ${services.length} services in the database.`);
    
    for (const service of services) {
      console.log(`\nService ID: ${service.id}, Name: ${service.name}, Primary Barber ID: ${service.barber_id}`);
      
      // 2. Check ServiceBarbers entries for this service
      const serviceBarbers = await ServiceBarber.findAll({
        where: { service_id: service.id }
      });
      
      console.log(`Found ${serviceBarbers.length} entries in ServiceBarbers table for this service.`);
      
      if (serviceBarbers.length === 0) {
        console.log(`WARNING: No service-barber relationships found for service ${service.id}. Adding the primary barber...`);
        
        // Add the primary barber to the junction table
        await ServiceBarber.create({
          service_id: service.id,
          barber_id: service.barber_id
        });
        
        console.log(`Fixed: Added relationship for primary barber ${service.barber_id}.`);
      } else {
        console.log('Service-barber relationships found:');
        for (const sb of serviceBarbers) {
          console.log(`  - Barber ID: ${sb.barber_id}`);
        }
      }
      
      // 3. Verify Barbers association is working
      if (service.Barbers) {
        console.log(`Service has ${service.Barbers.length} barbers associated through the model.`);
        for (const barber of service.Barbers) {
          console.log(`  - Barber ID: ${barber.id}, Name: ${barber.name}`);
        }
      } else {
        console.log('WARNING: No barbers loaded through association.');
      }
    }
    
    console.log('\nDiagnostics complete.');
  } catch (error) {
    console.error('Error during diagnostics:', error);
  } finally {
    await sequelize.close();
  }
}

runDiagnostics(); 