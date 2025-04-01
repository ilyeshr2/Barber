// models/service.js
module.exports = (sequelize, DataTypes) => {
    const Service = sequelize.define('Service', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      duree: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prix: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      // Use BarberId consistently (not BarbierId)
      BarberId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'Barbiers',
          key: 'id'
        }
      }
    });
  
    Service.associate = function(models) {
        Service.belongsTo(models.Barbier, {
          foreignKey: 'BarberId'  // This is already correct based on your DB
        });
      };
    
    return Service;
  };