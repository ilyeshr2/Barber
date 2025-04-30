'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      // Get all existing services
      const services = await queryInterface.sequelize.query(
        'SELECT id, barber_id FROM "Services"',
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Get existing service-barber relationships
      const existingRelations = await queryInterface.sequelize.query(
        'SELECT service_id, barber_id FROM "ServiceBarbers"',
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Create a map of existing relationships for quick lookup
      const existingMap = new Map(
        existingRelations.map(rel => [`${rel.service_id}-${rel.barber_id}`, true])
      );

      // Filter out services that already have relationships
      const newRelations = services.filter(service => 
        !existingMap.has(`${service.id}-${service.barber_id}`)
      );

      // Insert only new records into the junction table
      if (newRelations.length > 0) {
        const serviceBarberRecords = newRelations.map(service => ({
          service_id: service.id,
          barber_id: service.barber_id,
          created_at: new Date(),
          updated_at: new Date()
        }));

        await queryInterface.bulkInsert('ServiceBarbers', serviceBarberRecords);
      }

      console.log(`Migrated ${newRelations.length} new service relationships to the many-to-many structure`);
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