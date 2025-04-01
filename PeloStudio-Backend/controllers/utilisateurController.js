// controllers/utilisateurController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

exports.inscription = async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, genre, telephone, email, motDePasse } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const utilisateurExistant = await Utilisateur.findOne({ where: { telephone } });
    if (utilisateurExistant) {
      return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé" });
    }
    
    // Hachage du mot de passe
    const sel = await bcrypt.genSalt(10);
    const motDePasseHash = await bcrypt.hash(motDePasse, sel);
    
    // Créer un nouvel utilisateur
    const nouvelUtilisateur = await Utilisateur.create({
      nom,
      prenom,
      dateNaissance,
      genre,
      telephone,
      email,
      motDePasse: motDePasseHash
    });
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: nouvelUtilisateur.id }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      id: nouvelUtilisateur.id,
      nom: nouvelUtilisateur.nom,
      prenom: nouvelUtilisateur.prenom,
      telephone: nouvelUtilisateur.telephone,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
};

exports.connexion = async (req, res) => {
  try {
    const { telephone, motDePasse } = req.body;
    
    // Vérifier si l'utilisateur existe
    const utilisateur = await Utilisateur.findOne({ where: { telephone } });
    if (!utilisateur) {
      return res.status(400).json({ message: "Téléphone ou mot de passe incorrect" });
    }
    
    // Vérifier le mot de passe
    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!motDePasseValide) {
      return res.status(400).json({ message: "Téléphone ou mot de passe incorrect" });
    }
    
    // Générer un token JWT
    const token = jwt.sign(
      { id: utilisateur.id }, 
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    res.status(200).json({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      telephone: utilisateur.telephone,
      token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};

exports.getMonProfil = async (req, res) => {
  try {
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id, {
      attributes: { exclude: ['motDePasse'] }
    });
    
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(utilisateur);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

exports.mettreAJourProfil = async (req, res) => {
  try {
    const { nom, prenom, dateNaissance, genre, email } = req.body;
    
    const utilisateur = await Utilisateur.findByPk(req.utilisateur.id);
    if (!utilisateur) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Mise à jour des informations
    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.prenom = prenom || utilisateur.prenom;
    utilisateur.dateNaissance = dateNaissance || utilisateur.dateNaissance;
    utilisateur.genre = genre || utilisateur.genre;
    utilisateur.email = email || utilisateur.email;
    
    await utilisateur.save();
    
    res.status(200).json({
      id: utilisateur.id,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      dateNaissance: utilisateur.dateNaissance,
      genre: utilisateur.genre,
      telephone: utilisateur.telephone,
      email: utilisateur.email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};