//PeloStudio-Backend/server.js

const express = require('express');
const cors = require('cors');
const db = require('./models');
const routes = require('./routes');
const adminRoutes = require('./adminRoutes');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory for file storage
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  
  // Create subdirectories for different types of uploads
  fs.mkdirSync(path.join(uploadsDir, 'barbers'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'salon'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'publications'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'users'), { recursive: true });
}

// CORS configuration
app.use(cors({
  origin: '*', // In production, specify your exact domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve uploaded files - ensure the path is correct
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Add a route to get image details for debugging
app.get('/api/debug/images/:path', (req, res) => {
  const imagePath = req.params.path;
  const fullPath = path.join(__dirname, 'uploads', imagePath);
  
  if (fs.existsSync(fullPath)) {
    res.json({
      exists: true,
      path: fullPath,
      size: fs.statSync(fullPath).size,
      isFile: fs.statSync(fullPath).isFile()
    });
  } else {
    res.json({
      exists: false,
      path: fullPath
    });
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);
app.use('/api/admin', adminRoutes);

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    // First, authenticate the database connection
    await db.sequelize.authenticate();
    console.log('Database connection established');
    
    // Sync without force (only create tables if they don't exist)
    await db.sequelize.sync({ force: false });
    console.log('Database synchronized');
    
    // Only seed if the SEED_DB environment variable is set
    if (process.env.SEED_DB === 'true') {
      console.log('Seeding database...');
      await seedDatabase();
      console.log('Database seeding completed');
    }
    
    console.log('Server initialization complete');
  } catch (error) {
    console.error('Server initialization error:', error);
    process.exit(1); // Exit if we can't initialize properly
  }
});

// Database initial seed
const seedDatabase = async () => {
  try {
    // Check if salon already exists
    const salonCount = await db.Salon.count();
    if (salonCount > 0) {
      console.log('Salon already exists, skipping seed');
      return;
    }
    
    // 1. First create the salon as it's required by other entities
    const salon = await db.Salon.create({
      name: 'Yaniso Studio',
      address: 'Rue Jean-Talon E, Montréal',
      phone: '+1 438-686-6697',
      email: 'contact@yanisostudio.com',
      description: 'Yaniso Studio est votre barbier de confiance à Montréal.',
      logo_url: '/uploads/salon/default-logo.png',
      image_url: '/uploads/salon/default-salon.jpg'
    });
    console.log('Default salon created');

    // 2. Create business hours
    const defaultHours = [
      { day_of_week: 0, is_open: false, open_time: '09:00', close_time: '18:00' },
      { day_of_week: 1, is_open: true, open_time: '09:00', close_time: '18:00' },
      { day_of_week: 2, is_open: true, open_time: '09:00', close_time: '18:00' },
      { day_of_week: 3, is_open: true, open_time: '09:00', close_time: '18:00' },
      { day_of_week: 4, is_open: true, open_time: '09:00', close_time: '18:00' },
      { day_of_week: 5, is_open: true, open_time: '09:00', close_time: '18:00' },
      { day_of_week: 6, is_open: true, open_time: '10:00', close_time: '17:00' }
    ];
    
    await Promise.all(defaultHours.map(hour => 
      db.BusinessHours.create({
        ...hour,
        salon_id: salon.id
      })
    ));
    console.log('Business hours created');

    // 3. Create social links
    const defaultSocialLinks = [
      { platform: 'facebook', url: 'https://www.facebook.com/yanisostudio' },
      { platform: 'instagram', url: 'https://www.instagram.com/yanisostudio' },
      { platform: 'tiktok', url: 'https://www.tiktok.com/@yanisostudio' }
    ];
    
    await Promise.all(defaultSocialLinks.map(link => 
      db.SocialLinks.create({
        ...link,
        salon_id: salon.id
      })
    ));
    console.log('Social links created');

    // 4. Create admin user
    const bcrypt = require('bcrypt');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    await db.User.create({
      email: 'admin@yanisostudio.com',
      telephone: '+15555555555',
      password_hash: hashedPassword,
      role: 'admin',
      first_name: 'Admin',
      last_name: 'User',
      date_of_birth: '1990-01-01',
      gender: 'Homme'
    });
    console.log('Admin user created');

    // 5. Create barbers
    const barbers = await db.Barber.bulkCreate([
      {
        name: 'Yaniso Rekik',
        photo_url: '/uploads/barbers/default-barber-1.jpg',
        rating: 5.0,
        review_count: 8,
        salon_id: salon.id,
        is_active: true
      },
      {
        name: 'Islem',
        photo_url: '/uploads/barbers/default-barber-2.jpg',
        rating: 5.0,
        review_count: 5,
        salon_id: salon.id,
        is_active: true
      }
    ]);
    console.log('Barbers created');

    // 6. Create services for each barber
    const servicesData = [
      // For Yaniso
      { name: 'Coupe', duration: 20, price: 500, barber_id: barbers[0].id, is_active: true },
      { name: 'Barbe', duration: 20, price: 200, barber_id: barbers[0].id, is_active: true },
      { name: 'Protéines', duration: 60, price: 8000, barber_id: barbers[0].id, is_active: true },
      { name: 'Cire', duration: 15, price: 300, barber_id: barbers[0].id, is_active: true },
      { name: 'Traçage', duration: 10, price: 100, barber_id: barbers[0].id, is_active: true },
      
      // For Islem
      { name: 'Coupe', duration: 20, price: 500, barber_id: barbers[1].id, is_active: true },
      { name: 'Barbe', duration: 20, price: 200, barber_id: barbers[1].id, is_active: true },
      { name: 'Coloration', duration: 45, price: 1200, barber_id: barbers[1].id, is_active: true }
    ];
    
    await db.Service.bulkCreate(servicesData);
    console.log('Services created');

    // 7. Create publications
    await db.Publication.bulkCreate([
      {
        title: '',
        description: '',
        image_url: '/uploads/publications/post1.png',
        reactions: '😘😘',
        author_name: 'Mahmoud',
        author_image: '/uploads/publications/mahmoud.jpg',
        likes: 24
      },
      {
        title: '',
        description: '',
        image_url: '/uploads/publications/post2.png',
        reactions: '💈 🔥',
        author_name: 'Islem',
        author_image: '/uploads/publications/islem.jpg',
        likes: 18
      }
    ]);
    console.log('Publications created');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error; // Re-throw to be caught by the server initialization
  }
};