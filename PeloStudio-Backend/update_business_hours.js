// Script to update business hours manually
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Get database connection info from environment variables
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST || 'localhost';

// Connect to database
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'postgres',
  logging: console.log
});

// Define BusinessHours model
const BusinessHours = sequelize.define('BusinessHours', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  salon_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  day_of_week: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_open: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  open_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  close_time: {
    type: DataTypes.TIME,
    allowNull: false
  }
}, {
  tableName: 'BusinessHours',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Update business hours function
async function updateBusinessHours() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database!');
    
    // Update Wednesday to be open
    await BusinessHours.update(
      { is_open: true },
      { where: { day_of_week: 3 } }
    );
    console.log('Wednesday updated to open');
    
    // Update Friday to be closed
    await BusinessHours.update(
      { is_open: false },
      { where: { day_of_week: 5 } }
    );
    console.log('Friday updated to closed');
    
    // Get all business hours to verify
    const hours = await BusinessHours.findAll({
      order: [['day_of_week', 'ASC']]
    });
    
    console.log('Updated business hours:');
    hours.forEach(hour => {
      console.log(`Day ${hour.day_of_week}: ${hour.is_open ? 'Open' : 'Closed'} from ${hour.open_time} to ${hour.close_time}`);
    });
    
  } catch (error) {
    console.error('Error updating business hours:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the update function
updateBusinessHours(); 