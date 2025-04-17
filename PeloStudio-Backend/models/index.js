const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.js')[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Define models
const User = sequelize.define('User', {
  email: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: true
  },
  telephone: {
    type: Sequelize.STRING,
    unique: true,
    allowNull: false
  },
  password_hash: {
    type: Sequelize.STRING,
    allowNull: false
  },
  role: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'customer'
  },
  first_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  last_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  date_of_birth: {
    type: Sequelize.DATEONLY,
    allowNull: false
  },
  gender: {
    type: Sequelize.STRING,
    allowNull: false
  },
  photo_url: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Salon = sequelize.define('Salon', {
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  address: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  phone: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  logo_url: {
    type: Sequelize.STRING,
    allowNull: true
  },
  image_url: {
    type: Sequelize.STRING,
    allowNull: true
  }
}, {
  tableName: 'Salon',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const BusinessHours = sequelize.define('BusinessHours', {
  salon_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Salon',
      key: 'id'
    }
  },
  day_of_week: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  is_open: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  open_time: {
    type: Sequelize.TIME,
    allowNull: false
  },
  close_time: {
    type: Sequelize.TIME,
    allowNull: false
  }
}, {
  tableName: 'BusinessHours',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['salon_id', 'day_of_week']
    }
  ]
});

const SocialLinks = sequelize.define('SocialLinks', {
  salon_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Salon',
      key: 'id'
    }
  },
  platform: {
    type: Sequelize.STRING,
    allowNull: false
  },
  url: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  tableName: 'SocialLinks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['salon_id', 'platform']
    }
  ]
});

const Barber = sequelize.define('Barber', {
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  salon_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Salon',
      key: 'id'
    }
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  photo_url: {
    type: Sequelize.STRING,
    allowNull: true
  },
  rating: {
    type: Sequelize.DECIMAL(2, 1),
    allowNull: false,
    defaultValue: 5.0
  },
  review_count: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Barbers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Service = sequelize.define('Service', {
  barber_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Barbers',
      key: 'id'
    }
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  duration: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  price: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  is_active: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'Services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Appointment = sequelize.define('Appointment', {
  user_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  barber_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Barbers',
      key: 'id'
    }
  },
  service_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Services',
      key: 'id'
    }
  },
  appointment_date: {
    type: Sequelize.DATE,
    allowNull: false
  },
  status: {
    type: Sequelize.STRING,
    allowNull: false,
    defaultValue: 'confirmed'
  },
  notes: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  tableName: 'Appointments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const Publication = sequelize.define('Publication', {
  title: {
    type: Sequelize.STRING,
    allowNull: true
  },
  description: {
    type: Sequelize.TEXT,
    allowNull: true
  },
  image_url: {
    type: Sequelize.STRING,
    allowNull: true
  },
  author_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  author_image: {
    type: Sequelize.STRING,
    allowNull: true
  },
  reactions: {
    type: Sequelize.STRING,
    allowNull: true
  },
  likes: {
    type: Sequelize.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'Publications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

const AppSetting = sequelize.define('AppSetting', {
  setting_key: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  setting_value: {
    type: Sequelize.TEXT,
    allowNull: true
  }
}, {
  tableName: 'AppSettings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Add FileStorage model
const FileStorage = sequelize.define('FileStorage', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  original_name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  file_path: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  file_size: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  mime_type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  category: {
    type: Sequelize.ENUM('barbers', 'salon', 'publications', 'users', 'misc'),
    defaultValue: 'misc'
  },
  upload_date: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW
  }
}, {
  tableName: 'file_storage',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Define ServiceBarber junction model
const ServiceBarber = sequelize.define('ServiceBarber', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  service_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: 'Services',
      key: 'id'
    }
  },
  barber_id: {
    type: Sequelize.INTEGER,
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

// Define associations
Salon.hasMany(BusinessHours, { foreignKey: 'salon_id' });
BusinessHours.belongsTo(Salon, { foreignKey: 'salon_id' });

Salon.hasMany(SocialLinks, { foreignKey: 'salon_id' });
SocialLinks.belongsTo(Salon, { foreignKey: 'salon_id' });

Salon.hasMany(Barber, { foreignKey: 'salon_id' });
Barber.belongsTo(Salon, { foreignKey: 'salon_id' });

User.hasOne(Barber, { foreignKey: 'user_id' });
Barber.belongsTo(User, { foreignKey: 'user_id' });

// Update to many-to-many relationship
Barber.belongsToMany(Service, { through: ServiceBarber, foreignKey: 'barber_id', otherKey: 'service_id' });
Service.belongsToMany(Barber, { through: ServiceBarber, foreignKey: 'service_id', otherKey: 'barber_id' });

// Keep the original associations for backward compatibility
Barber.hasMany(Service, { foreignKey: 'barber_id' });
Service.belongsTo(Barber, { foreignKey: 'barber_id' });

User.hasMany(Appointment, { foreignKey: 'user_id' });
Appointment.belongsTo(User, { foreignKey: 'user_id' });

Barber.hasMany(Appointment, { foreignKey: 'barber_id' });
Appointment.belongsTo(Barber, { foreignKey: 'barber_id' });

Service.hasMany(Appointment, { foreignKey: 'service_id' });
Appointment.belongsTo(Service, { foreignKey: 'service_id' });

// Add models to db object
db.User = User;
db.Salon = Salon;
db.BusinessHours = BusinessHours;
db.SocialLinks = SocialLinks;
db.Barber = Barber;
db.Service = Service;
db.Appointment = Appointment;
db.Publication = Publication;
db.AppSetting = AppSetting;
db.FileStorage = FileStorage;
db.ServiceBarber = ServiceBarber;

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;