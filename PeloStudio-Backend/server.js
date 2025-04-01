//PeloStudio-Backend/server.js

const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Database initial seed
// In server.js
const seedDatabase = async () => {
    try {
      // Log current data in database
      const barbersCount = await sequelize.models.Barbier.count();
      console.log(`Current barbers in database: ${barbersCount}`);
      
      const servicesCount = await sequelize.models.Service.count();
      console.log(`Current services in database: ${servicesCount}`);
      
      // If there are no services, add them
      if (servicesCount === 0) {
        console.log('No services found. Adding services to database...');
        
        // First check if barbers exist
        let barbers = await sequelize.models.Barbier.findAll();
        
        // If no barbers exist, create them
        if (barbers.length === 0) {
          console.log('No barbers found. Creating barbers first...');
          
          barbers = await sequelize.models.Barbier.bulkCreate([
            {
              nom: 'Rafik Pelo',
              photoUrl: 'https://i.imgur.com/1234.jpg',
              note: 5.0,
              nombreAvis: 8,
              salonId: 1
            },
            {
              nom: 'Islem',
              photoUrl: 'https://i.imgur.com/5678.jpg',
              note: 5.0,
              nombreAvis: 5,
              salonId: 1
            }
          ]);
          
          console.log(`Created ${barbers.length} barbers`);
        }
        
        // Now we know barbers exist, create services for them
        const rafik = barbers[0];
        const islem = barbers.length > 1 ? barbers[1] : barbers[0];
        
        console.log(`Creating services for barber: ${rafik.nom} (ID: ${rafik.id})`);
        
        // Create services for Rafik
        const rafikServices = await sequelize.models.Service.bulkCreate([
          { nom: 'Haircut', duree: 20, prix: 500, BarberId: rafik.id },
          { nom: 'Beard', duree: 20, prix: 200, BarberId: rafik.id },
          { nom: 'Proteins', duree: 60, prix: 8000, BarberId: rafik.id },
          { nom: 'Wax', duree: 15, prix: 300, BarberId: rafik.id },
          { nom: 'Tracing', duree: 10, prix: 100, BarberId: rafik.id }
        ]);
        
        console.log(`Creating services for barber: ${islem.nom} (ID: ${islem.id})`);
        
        // Create services for Islem
        const islemServices = await sequelize.models.Service.bulkCreate([
          { nom: 'Haircut', duree: 20, prix: 500, BarberId: islem.id },
          { nom: 'Beard', duree: 20, prix: 200, BarberId: islem.id },
          { nom: 'Coloring', duree: 45, prix: 1200, BarberId: islem.id }
        ]);
        
        console.log(`Created ${rafikServices.length + islemServices.length} services`);
        console.log('Database seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  };
// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    await sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync database models
    await sequelize.sync();
    console.log('Database synchronized');
    
    // Seed database with initial data
    await seedDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
  }
});