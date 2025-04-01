// models/rendezVous.js
module.exports = (sequelize, DataTypes) => {
    const RendezVous = sequelize.define('RendezVous', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      statut: {
        type: DataTypes.ENUM('confirmé', 'annulé', 'terminé'),
        defaultValue: 'confirmé',
      },
      UtilisateurId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Utilisateurs',
          key: 'id'
        }
      },
      // Use BarbierId with capital I to match the database column
      BarbierId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Barbiers',
          key: 'id'
        }
      },
      ServiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Services',
          key: 'id'
        }
      }
    });
  
    RendezVous.associate = function(models) {
      RendezVous.belongsTo(models.Utilisateur, {
        foreignKey: 'UtilisateurId'
      });
      
      // Use BarbierId with capital I to match the database column
      RendezVous.belongsTo(models.Barbier, {
        foreignKey: 'BarbierId'
      });
      
      RendezVous.belongsTo(models.Service, {
        foreignKey: 'ServiceId'
      });
    };
    
    return RendezVous;
  };