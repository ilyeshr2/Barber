'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // First, let's check if the ServiceBarbers table exists and has data
      const tableExists = await queryInterface.sequelize.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ServiceBarbers'
        );`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (tableExists[0].exists) {
        console.log('ServiceBarbers table already exists, skipping migration');
        return;
      }

      // Get all existing services
      const services = await queryInterface.sequelize.query(
        'SELECT id, barber_id FROM "Services"',
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Insert records into the junction table for existing services
      if (services.length > 0) {
        const serviceBarberRecords = services.map(service => ({
          service_id: service.id,
          barber_id: service.barber_id,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await queryInterface.bulkInsert('ServiceBarbers', serviceBarberRecords);
      }

      console.log(`Migrated ${services.length} services to the many-to-many structure`);
    } catch (error) {
      console.error('Migration error:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    // This migration cannot be undone easily as it's a data migration
    // We would need to determine which barber to keep for each service
    await queryInterface.bulkDelete('ServiceBarbers', null, {});
  }
}; 