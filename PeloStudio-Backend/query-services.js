const { sequelize } = require('./models');

async function queryServices() {
  try {
    console.log('Querying services and barber relationships...');
    
    // Get services and their barbers
    const [services] = await sequelize.query(`
      SELECT 
        s.id as service_id, 
        s.name as service_name,
        s.barber_id as primary_barber_id,
        array_agg(sb.barber_id) as all_barber_ids
      FROM 
        "Services" s
      JOIN 
        "ServiceBarbers" sb ON s.id = sb.service_id
      GROUP BY 
        s.id, s.name, s.barber_id
      ORDER BY 
        s.id;
    `);
    
    console.log('\nServices with barber relationships:');
    
    if (services.length === 0) {
      console.log('No services found.');
    } else {
      for (const service of services) {
        console.log(`\nService ID: ${service.service_id}, Name: ${service.service_name}`);
        console.log(`Primary Barber ID (from Services table): ${service.primary_barber_id}`);
        console.log(`All Barber IDs (from ServiceBarbers table): ${service.all_barber_ids}`);
      }
    }
    
    // Now get all rows from ServiceBarbers table directly
    const [serviceBarbers] = await sequelize.query(`
      SELECT service_id, barber_id, created_at
      FROM "ServiceBarbers"
      ORDER BY service_id, barber_id;
    `);
    
    console.log('\nAll ServiceBarbers junction table entries:');
    console.table(serviceBarbers);
    
  } catch (error) {
    console.error('Error querying services:', error);
  } finally {
    await sequelize.close();
  }
}

queryServices(); 