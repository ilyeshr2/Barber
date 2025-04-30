const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class PublicationLike extends Model {
    static associate(models) {
      PublicationLike.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      PublicationLike.belongsTo(models.Publication, {
        foreignKey: 'publication_id',
        as: 'publication'
      });
    }
  }

  PublicationLike.init({
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    publication_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'publications',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'PublicationLike',
    tableName: 'publication_likes',
    timestamps: true,
    underscored: true
  });

  return PublicationLike;
}; 