module.exports = (sequelize, DataTypes) => {
  const ServiceBarber = sequelize.define('ServiceBarber', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    service_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Services',
        key: 'id'
      }
    },
    barber_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Barbers',
        key: 'id'
      }
    }
  }, {
    tableName: 'ServiceBarbers',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['service_id', 'barber_id']
      }
    ]
  });

  return ServiceBarber;
}; 