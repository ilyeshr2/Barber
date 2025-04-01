// models/barbier.js
module.exports = (sequelize, DataTypes) => {
    const Barbier = sequelize.define('Barbier', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      photoUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      note: {
        type: DataTypes.FLOAT,
        defaultValue: 5.0,
      },
      nombreAvis: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      salonId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
    });
  
    Barbier.associate = function(models) {
        Barbier.hasMany(models.Service, {
          foreignKey: 'BarberId'  // This is already correct based on your DB
        });
      };
    
    return Barbier;
  };