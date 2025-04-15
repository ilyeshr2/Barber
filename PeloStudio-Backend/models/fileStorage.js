module.exports = (sequelize, DataTypes) => {
  const FileStorage = sequelize.define('FileStorage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    original_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    mime_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('barbers', 'salon', 'publications', 'users', 'misc'),
      defaultValue: 'misc'
    },
    upload_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'file_storage',
    timestamps: true
  });

  return FileStorage;
}; 