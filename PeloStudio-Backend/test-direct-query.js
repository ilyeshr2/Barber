const { sequelize } = require('./models');

async function testDirectQuery() {
  try {
    console.log('Testing direct SQL query for barber services...');
    
    // Test for barber ID 6 (which was reported to have issues)
    const barberIds = [6, 8, 9];
    
    for (const barberId of barberIds) {
      console.log(`\nTesting for Barber ID: ${barberId}`);
      
      // Use direct SQL query with raw: true option
      try {
        const [results] = await sequelize.query(`
          SELECT 
            s.id, 
            s.name, 
            s.description, 
            s.duration, 
            s.price, 
            s.is_active
          FROM 
            "Services" s
          JOIN 
            "ServiceBarbers" sb ON s.id = sb.service_id
          WHERE 
            sb.barber_id = ${barberId}
        `, { 
          raw: true,
          type: sequelize.QueryTypes.SELECT
        });
        
        // Check current junction table entries for this barber
        const [junctions] = await sequelize.query(`
          SELECT service_id, barber_id 
          FROM "ServiceBarbers" 
          WHERE barber_id = ${barberId}
        `, { 
          raw: true 
        });
        
        console.log(`Junction table entries for barber ${barberId}: ${junctions ? junctions.length : 0}`);
        if (junctions && junctions.length > 0) {
          junctions.forEach(j => console.log(`  - Service ID: ${j.service_id}`));
        }
        
        console.log(`Found ${results ? results.length : 0} services for barber ID: ${barberId}`);
        
        if (results && results.length > 0) {
          results.forEach(service => {
            console.log(`  - Service ID: ${service.id}, Name: ${service.name}, Price: ${service.price}`);
          });
        } else {
          console.log('  No services found for this barber.');
        }
      } catch (error) {
        console.error(`Error querying for barber ${barberId}:`, error);
      }
    }
    
    // Try a simpler query to check if basic queries work
    console.log('\nTesting simpler query to verify database connection:');
    const [services] = await sequelize.query('SELECT * FROM "Services"', { raw: true });
    console.log(`Found ${services.length} total services in database`);
    
    // Check ServiceBarbers table
    console.log('\nChecking ServiceBarbers table:');
    const [junctionRecords] = await sequelize.query('SELECT * FROM "ServiceBarbers"', { raw: true });
    console.log(`Found ${junctionRecords.length} records in ServiceBarbers table`);
    junctionRecords.forEach(record => {
      console.log(`  - Service ID: ${record.service_id}, Barber ID: ${record.barber_id}`);
    });
    
  } catch (error) {
    console.error('Error testing direct query:', error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

testDirectQuery(); 