'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activities', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Type of activity (appointment, client, service, etc.)'
      },
      action: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Action performed (created, updated, deleted, etc.)'
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID of the entity this activity is related to'
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        comment: 'ID of the user who performed this action (if applicable)'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Human-readable title of the activity'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Additional details about the activity'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Any additional data related to the activity'
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Icon class to represent this activity type'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for faster querying
    await queryInterface.addIndex('activities', ['type']);
    await queryInterface.addIndex('activities', ['entity_id']);
    await queryInterface.addIndex('activities', ['user_id']);
    await queryInterface.addIndex('activities', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activities');
  }
}; 