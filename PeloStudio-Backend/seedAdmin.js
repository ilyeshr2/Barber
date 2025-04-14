const bcrypt = require('bcrypt');
const { Utilisateur } = require('./models');

async function createAdminUser() {
  try {
    // Check if the admin user already exists
    const existingAdmin = await Utilisateur.findOne({
      where: { email: 'admin@yanisostudio.com' }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the admin password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);
    
    // Create the admin user
    const adminUser = await Utilisateur.create({
      nom: 'Admin',
      prenom: 'Super',
      dateNaissance: '1990-01-01',
      genre: 'Homme',
      telephone: '+15555555555',
      email: 'admin@yanisostudio.com',
      motDePasse: hashedPassword
    });
    
    console.log('Admin user created successfully:', adminUser.id);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Execute the function
createAdminUser();