// direct-query-api.js
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Create a separate Express app running on a different port
const app = express();
const PORT = 3001;

// Enable CORS for all origins
app.use(cors());

// Add middleware
app.use(express.json());

// API endpoints
app.get('/api/barbers/:id/services', async (req, res) => {
  try {
    const barberId = req.params.id;
    console.log(`[Direct API] Fetching services for barber ID: ${barberId}`);
    
    // Use direct SQL query
    const query = `
      SELECT 
        s.id, 
        s.name as name, 
        s.description, 
        s.duration, 
        s.price, 
        s.is_active, 
        s.created_at, 
        s.updated_at
      FROM 
        "Services" s
      JOIN 
        "ServiceBarbers" sb ON s.id = sb.service_id
      WHERE 
        sb.barber_id = ${barberId}
    `;
    
    const [services] = await sequelize.query(query, { raw: true });
    
    console.log(`[Direct API] Found ${services ? services.length : 0} services for barber ID: ${barberId}`);
    
    if (services && services.length > 0) {
      services.forEach(service => {
        console.log(`  - Service ID: ${service.id}, Name: ${service.name}, Price: ${service.price}`);
      });
    }
    
    // Send empty array if no services found
    res.status(200).json(services || []);
  } catch (error) {
    console.error('[Direct API] Error in direct query for barber services:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Direct query API running on port ${PORT}`);
});

// Print database connection info
sequelize.authenticate()
  .then(() => console.log('Database connection successful'))
  .catch(err => console.error('Database connection error:', err)); 