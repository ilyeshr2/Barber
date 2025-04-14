// controllers/publicationController.js - NEW FILE
const { Publication } = require('../models');
const path = require('path');
const fs = require('fs');

// Helper function to handle file uploads
const handleFileUpload = (file, folderName) => {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(__dirname, '../uploads', folderName);
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Generate unique filename
  const fileExt = path.extname(file.originalname);
  const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExt}`;
  const filePath = path.join(uploadsDir, fileName);
  
  // Write file to disk
  fs.writeFileSync(filePath, file.buffer);
  
  // Return relative path for database storage
  return `/uploads/${folderName}/${fileName}`;
};

// Get all publications
exports.getAllPublications = async (req, res) => {
  try {
    const publications = await Publication.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(publications);
  } catch (error) {
    console.error('Error getting publications:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get publication by ID
exports.getPublicationById = async (req, res) => {
  try {
    const publication = await Publication.findByPk(req.params.id);
    
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    res.status(200).json(publication);
  } catch (error) {
    console.error('Error getting publication:', error);
    res.status(500).json({ message: 'Error getting publication' });
  }
};

// Create a new publication
exports.createPublication = async (req, res) => {
  try {
    const { title, description, reactions, authorName } = req.body;
    
    if (!authorName) {
      return res.status(400).json({ message: 'Author name is required' });
    }
    
    // Create new publication
    const publication = await Publication.create({
      title,
      description,
      reactions,
      authorName,
      likes: 0
    });
    
    // Handle image upload if provided
    if (req.files && req.files.image) {
      publication.imageUrl = handleFileUpload(req.files.image[0], 'publications');
    }
    
    // Handle author image upload if provided
    if (req.files && req.files.authorImage) {
      publication.authorImage = handleFileUpload(req.files.authorImage[0], 'authors');
    }
    
    await publication.save();
    
    res.status(201).json(publication);
  } catch (error) {
    console.error('Error creating publication:', error);
    res.status(500).json({ message: 'Error creating publication' });
  }
};

// Update a publication
exports.updatePublication = async (req, res) => {
  try {
    const { title, description, reactions, authorName } = req.body;
    
    // Find the publication
    const publication = await Publication.findByPk(req.params.id);
    
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    // Update fields
    if (title !== undefined) publication.title = title;
    if (description !== undefined) publication.description = description;
    if (reactions !== undefined) publication.reactions = reactions;
    if (authorName) publication.authorName = authorName;
    
    // Handle image upload if provided
    if (req.files && req.files.image) {
      publication.imageUrl = handleFileUpload(req.files.image[0], 'publications');
    }
    
    // Handle author image upload if provided
    if (req.files && req.files.authorImage) {
      publication.authorImage = handleFileUpload(req.files.authorImage[0], 'authors');
    }
    
    await publication.save();
    
    res.status(200).json(publication);
  } catch (error) {
    console.error('Error updating publication:', error);
    res.status(500).json({ message: 'Error updating publication' });
  }
};

// Delete a publication
exports.deletePublication = async (req, res) => {
  try {
    const publication = await Publication.findByPk(req.params.id);
    
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    // Delete associated files
    if (publication.imageUrl) {
      const imagePath = path.join(__dirname, '..', publication.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    if (publication.authorImage) {
      const authorImagePath = path.join(__dirname, '..', publication.authorImage);
      if (fs.existsSync(authorImagePath)) {
        fs.unlinkSync(authorImagePath);
      }
    }
    
    await publication.destroy();
    
    res.status(200).json({ message: 'Publication deleted successfully' });
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({ message: 'Error deleting publication' });
  }
};

// Like a publication
exports.likePublication = async (req, res) => {
  try {
    const publication = await Publication.findByPk(req.params.id);
    
    if (!publication) {
      return res.status(404).json({ message: 'Publication not found' });
    }
    
    // Increment the likes count
    publication.likes += 1;
    await publication.save();
    
    res.status(200).json({ likes: publication.likes });
  } catch (error) {
    console.error('Error liking publication:', error);
    res.status(500).json({ message: 'Error liking publication' });
  }
};

// Modified seedDatabase function in server.js
const seedDatabase = async () => {
  try {
    // Log current data in database
    const barbersCount = await sequelize.models.Barbier.count();
    console.log(`Current barbers in database: ${barbersCount}`);
    
    const servicesCount = await sequelize.models.Service.count();
    console.log(`Current services in database: ${servicesCount}`);
    
    // Check if salon exists, if not create it
    const salonCount = await sequelize.models.Salon.count();
    if (salonCount === 0) {
      console.log('No salon found. Creating default salon...');
      
      const salon = await sequelize.models.Salon.create({
        name: 'Yaniso Studio',
        address: 'Rue Jean-Talon E, Montréal',
        phone: '+1 438-686-6697',
        email: 'contact@yanisostudio.com',
        description: 'Yaniso Studio est votre barbier de confiance à Montréal.',
        logoUrl: '/images/yaniso-logo.png',
        imageUrl: '/images/salon.jpg'
      });
      
      // Create default business hours
      const defaultHours = [
        { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '18:00' }, // Sunday
        { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Monday
        { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Tuesday
        { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Wednesday
        { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Thursday
        { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '18:00' }, // Friday
        { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '17:00' }  // Saturday
      ];
      
      await Promise.all(defaultHours.map(hour => 
        sequelize.models.BusinessHour.create({
          ...hour,
          salonId: salon.id
        })
      ));
      
      // Create default social links
      const defaultSocialLinks = [
        { platform: 'facebook', url: 'https://www.facebook.com/yanisostudio' },
        { platform: 'instagram', url: 'https://www.instagram.com/yanisostudio' },
        { platform: 'tiktok', url: 'https://www.tiktok.com/@yanisostudio' }
      ];
      
      await Promise.all(defaultSocialLinks.map(link => 
        sequelize.models.SocialLink.create({
          ...link,
          salonId: salon.id
        })
      ));
      
      console.log('Default salon created');
    }
    
    // Check if publications exist, if not create some default ones
    const publicationsCount = await sequelize.models.Publication.count();
    if (publicationsCount === 0) {
      console.log('No publications found. Creating default publications...');
      
      await sequelize.models.Publication.bulkCreate([
        {
          title: '',
          description: '',
          imageUrl: '/images/post1.png',
          reactions: '😘😘',
          authorName: 'Mahmoud',
          authorImage: '/images/mahmoud.jpg',
          likes: 24
        },
        {
          title: '',
          description: '',
          imageUrl: '/images/post2.png',
          reactions: '💈 🔥',
          authorName: 'Islem',
          authorImage: '/images/islem.jpg',
          likes: 18
        },
        {
          title: 'Naps nous rend visite',
          description: 'Une journée extraordinaire chez Yaniso Studio ! 🎤 ✨ Nous avons eu l\'honneur d\'accueillir le talentueux rappeur Naps dans notre salon. Une expérience unique...',
          imageUrl: '/images/post3.png',
          reactions: '',
          authorName: 'Yaniso Rkik',
          authorImage: '/images/rafik.jpg',
          likes: 56
        },
        {
          title: '',
          description: 'Une journée inoubliable avec notre artiste dans notre studio ! ✨ Nous avons eu le plaisir d accueillir cette star pour une séance exclusive. Son style unique et sa personnalité rayonnante ont créé une ambiance exceptionnelle. Merci pour ces moments de créativité partagés ! #MomentPrivilégié #RencontreExceptionnelle ✂️...',
          imageUrl: '/images/post4.png',
          reactions: '',
          authorName: 'Yaniso Rkik',
          authorImage: '/images/rafik.jpg',
          likes: 42
        }
      ]);
      
      console.log('Default publications created');
    }
    
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
            nom: 'Yaniso Rekik',
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