module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255]
      }
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    phone: {
      type: DataTypes.STRING,
      validate: {
        is: /^[\+]?[1-9][\d]{0,15}$/
      }
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_verification_token: {
      type: DataTypes.STRING
    },
    password_reset_token: {
      type: DataTypes.STRING
    },
    password_reset_expires: {
      type: DataTypes.DATE
    },
    last_login: {
      type: DataTypes.DATE
    },
    login_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    locked_until: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'users',
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['role_id']
      },
      {
        fields: ['is_active']
      }
    ],
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const bcrypt = require('bcryptjs');
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, rounds);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const bcrypt = require('bcryptjs');
          const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
          user.password = await bcrypt.hash(user.password, rounds);
        }
      }
    }
  });

  // Instance methods
  User.prototype.validatePassword = async function(password) {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(password, this.password);
  };

  User.prototype.toJSON = function() {
    const values = { ...this.get() };
    delete values.password;
    delete values.password_reset_token;
    delete values.email_verification_token;
    return values;
  };

  User.prototype.getFullName = function() {
    return `${this.first_name} ${this.last_name}`;
  };

  return User;
};