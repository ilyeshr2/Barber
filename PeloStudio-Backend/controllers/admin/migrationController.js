const path = require('path');
const { exec } = require('child_process');
const fs = require('fs').promises;
const { Sequelize } = require('sequelize');
const sequelize = require('../../models').sequelize;

// Helper function to execute a command and return promise
const execPromise = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.warn(`Command warning: ${stderr}`);
      }
      resolve(stdout);
    });
  });
};

// Run all pending migrations
const runMigrations = async (req, res) => {
  try {
    const migrationPath = path.resolve(__dirname, '../../migrations');
    
    // Check if migration directory exists
    try {
      await fs.access(migrationPath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Migration directory not found',
      });
    }
    
    // Execute migrations using Sequelize CLI
    const result = await execPromise('npx sequelize-cli db:migrate');
    
    return res.status(200).json({
      success: true,
      message: 'Migrations executed successfully',
      details: result
    });
  } catch (error) {
    console.error('Error running migrations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to run migrations',
      error: error.message
    });
  }
};

// Create a new migration file
const createMigration = async (req, res) => {
  try {
    const { name, type } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Migration name is required'
      });
    }
    
    let command = `npx sequelize-cli migration:generate --name ${name}`;
    
    // If provided a type, use a template
    if (type === 'createTable') {
      const { tableName, attributes } = req.body;
      
      if (!tableName || !attributes) {
        return res.status(400).json({
          success: false,
          message: 'Table name and attributes are required for createTable type'
        });
      }
      
      // We could enhance this to actually create a migration with the table
      // For now, we'll just create a basic migration file
    }
    
    const result = await execPromise(command);
    
    return res.status(200).json({
      success: true,
      message: 'Migration file created successfully',
      details: result
    });
  } catch (error) {
    console.error('Error creating migration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create migration',
      error: error.message
    });
  }
};

// Undo the most recent migration
const undoMigration = async (req, res) => {
  try {
    // Check if we should undo all migrations
    const { all } = req.query;
    
    let command = 'npx sequelize-cli db:migrate:undo';
    if (all === 'true') {
      command = 'npx sequelize-cli db:migrate:undo:all';
    }
    
    const result = await execPromise(command);
    
    return res.status(200).json({
      success: true,
      message: all === 'true' ? 'All migrations undone successfully' : 'Last migration undone successfully',
      details: result
    });
  } catch (error) {
    console.error('Error undoing migration:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to undo migration',
      error: error.message
    });
  }
};

// Get migration status
const getMigrationStatus = async (req, res) => {
  try {
    const result = await execPromise('npx sequelize-cli db:migrate:status');
    
    return res.status(200).json({
      success: true,
      message: 'Migration status retrieved',
      details: result
    });
  } catch (error) {
    console.error('Error getting migration status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get migration status',
      error: error.message
    });
  }
};

module.exports = {
  runMigrations,
  createMigration,
  undoMigration,
  getMigrationStatus
}; 