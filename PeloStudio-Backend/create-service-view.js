const { sequelize } = require('./models');

async function createServiceView() {
  try {
    console.log('Creating a view for service-barber relationships...');
    
    // Create the view using raw SQL
    await sequelize.query(`
      CREATE OR REPLACE VIEW service_barbers_view AS
      SELECT 
        s.id as service_id,
        s.name as service_name,
        s.description as service_description,
        s.duration,
        s.price,
        s.is_active,
        s.created_at,
        s.updated_at,
        b.id as barber_id,
        b.name as barber_name,
        b.is_active as barber_is_active
      FROM 
        "Services" s
      JOIN 
        "ServiceBarbers" sb ON s.id = sb.service_id
      JOIN 
        "Barbers" b ON sb.barber_id = b.id
      ORDER BY 
        s.id, b.id;
    `);
    
    console.log('View created successfully. You can now query:');
    console.log('SELECT * FROM service_barbers_view;');
    
    // Test the view by querying it
    const [results] = await sequelize.query('SELECT * FROM service_barbers_view;');
    console.log('\nSample results:');
    console.table(results);
    
  } catch (error) {
    console.error('Error creating view:', error);
  } finally {
    await sequelize.close();
  }
}

createServiceView(); 