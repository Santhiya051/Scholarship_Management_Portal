module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isIn: [['student', 'coordinator', 'committee', 'finance', 'admin']]
      }
    },
    display_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'roles',
    indexes: [
      {
        unique: true,
        fields: ['name']
      }
    ]
  });

  // Instance methods
  Role.prototype.hasPermission = function(permission) {
    return this.permissions && this.permissions.includes(permission);
  };

  return Role;
};