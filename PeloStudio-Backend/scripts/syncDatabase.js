#!/usr/bin/env node
const db = require('../models');
require('dotenv').config();

async function syncDatabase() {
  try {
    console.log('Connecting to database...');
    await db.sequelize.authenticate();
    console.log('Connection established successfully.');
    
    console.log('Syncing database models...');
    await db.sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error syncing database:', error);
    process.exit(1);
  }
}

syncDatabase(); 