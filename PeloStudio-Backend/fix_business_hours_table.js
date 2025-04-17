/**
 * This script fixes the business hours by ensuring data is properly stored
 * in the BusinessHours table with correct relationships.
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const { Sequelize, DataTypes } = require('sequelize');

// Database connection
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD || process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = process.env.DB_PORT || 5432;

// Connect to database
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: 'postgres',
  logging: console.log
});

// Define models
const Salon = sequelize.define('Salon', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: DataTypes.STRING,
  phone: DataTypes.STRING,
  email: DataTypes.STRING,
  description: DataTypes.TEXT,
  logo_url: DataTypes.STRING,
  image_url: DataTypes.STRING,
  business_hours: DataTypes.JSONB  // This stores the hours as JSON
}, {
  tableName: 'Salons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const BusinessHours = sequelize.define('BusinessHours', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  salon_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Salons',
      key: 'id'
    }
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

// Define relationships
Salon.hasMany(BusinessHours, { foreignKey: 'salon_id' });
BusinessHours.belongsTo(Salon, { foreignKey: 'salon_id' });

// Function to sync hours between JSON field and BusinessHours table
async function syncBusinessHours() {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Get salon data
    const salon = await Salon.findOne();
    if (!salon) {
      console.error('No salon found in database');
      return;
    }
    console.log('Found salon:', salon.name);
    
    // Get current business hours from JSON field
    let hoursFromJson = [];
    if (salon.business_hours && Array.isArray(salon.business_hours)) {
      hoursFromJson = salon.business_hours;
      console.log('Business hours from JSON field:', JSON.stringify(hoursFromJson, null, 2));
    } else {
      console.log('No business hours found in JSON field');
    }
    
    // Get current business hours from BusinessHours table
    const hoursFromTable = await BusinessHours.findAll({
      where: { salon_id: salon.id },
      order: [['day_of_week', 'ASC']]
    });
    console.log('Business hours from table:', JSON.stringify(hoursFromTable.map(h => h.toJSON()), null, 2));
    
    // Step 1: Update BusinessHours table if JSON has data
    if (hoursFromJson.length > 0) {
      console.log('Updating BusinessHours table from JSON data...');
      for (const day of hoursFromJson) {
        await BusinessHours.update(
          {
            is_open: day.is_open,
            open_time: day.open_time,
            close_time: day.close_time
          },
          {
            where: {
              salon_id: salon.id,
              day_of_week: day.day_of_week
            }
          }
        );
        console.log(`Updated day ${day.day_of_week} in BusinessHours table`);
      }
    }
    
    // Step 2: Update JSON field from BusinessHours table
    const updatedHoursFromTable = await BusinessHours.findAll({
      where: { salon_id: salon.id },
      order: [['day_of_week', 'ASC']]
    });
    
    // Format hours for JSON field
    const formattedHours = updatedHoursFromTable.map(hour => ({
      day_of_week: hour.day_of_week,
      is_open: hour.is_open,
      open_time: hour.open_time,
      close_time: hour.close_time
    }));
    
    // Update salon with formatted hours
    salon.business_hours = formattedHours;
    await salon.save();
    console.log('Updated JSON field in Salon table with current hours');
    
    // Verify final state
    const finalSalon = await Salon.findOne({
      include: [
        {
          model: BusinessHours,
          attributes: ['day_of_week', 'is_open', 'open_time', 'close_time']
        }
      ]
    });
    
    console.log('Final salon state:');
    console.log('- JSON business_hours:', JSON.stringify(finalSalon.business_hours, null, 2));
    console.log('- Related BusinessHours:', JSON.stringify(finalSalon.BusinessHours, null, 2));
    
    console.log('Business hours synchronization completed successfully!');
  } catch (error) {
    console.error('Error synchronizing business hours:', error);
  } finally {
    await sequelize.close();
    console.log('Database connection closed');
  }
}

// Run the sync function
syncBusinessHours(); 