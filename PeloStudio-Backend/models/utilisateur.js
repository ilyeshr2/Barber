//models/utilisateur.js

module.exports = (sequelize, DataTypes) => {
    const Utilisateur = sequelize.define('Utilisateur', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dateNaissance: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      genre: {
        type: DataTypes.ENUM('Homme', 'Femme', 'Autre'),
        allowNull: false,
      },
      telephone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      motDePasse: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });

    Utilisateur.associate = function(models) {
        // A Utilisateur has many RendezVous
        Utilisateur.hasMany(models.RendezVous, {
          foreignKey: 'UtilisateurId'
        });
      };
  
    return Utilisateur;
  };