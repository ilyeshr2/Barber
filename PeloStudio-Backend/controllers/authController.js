// controllers/authController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

// Inscription d'un nouvel utilisateur
exports.signup = async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, genre, telephone, email, motDePasse } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Utilisateur.findOne({ where: { telephone } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
    }cl
    
    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);
    
    // Créer l'utilisateur
    const newUser = await Utilisateur.create({
      nom,
      prenom,
      dateNaissance,
      genre,
      telephone,
      email,
      motDePasse: hashedPassword
    });
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      id: newUser.id,
      nom: newUser.nom,
      prenom: newUser.prenom,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'inscription' });
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res) => {
  try {
    const { telephone, motDePasse } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await Utilisateur.findOne({ where: { telephone } });
    if (!user) {
      return res.status(401).json({ message: 'Téléphone ou mot de passe incorrect' });
    }
    
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: 'Téléphone ou mot de passe incorrect' });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
};

// Obtenir le profil de l'utilisateur connecté
exports.getProfile = async (req, res) => {
  try {
    const user = await Utilisateur.findByPk(req.userId, {
      attributes: { exclude: ['motDePasse'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
exports.updateProfile = async (req, res) => {
    try {
      const { nom, prenom, dateNaissance, genre, email } = req.body;
      
      const user = await Utilisateur.findByPk(req.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      
      // Update user information
      if (nom) user.nom = nom;
      if (prenom) user.prenom = prenom;
      if (dateNaissance) user.dateNaissance = dateNaissance;
      if (genre) user.genre = genre;
      if (email) user.email = email;
      
      await user.save();
      
      // Return updated user without password
      const updatedUser = await Utilisateur.findByPk(req.userId, {
        attributes: { exclude: ['motDePasse'] }
      });
      
      res.status(200).json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Erreur serveur' });
    }
  };