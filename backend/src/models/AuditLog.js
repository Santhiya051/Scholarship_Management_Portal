module.exports = (sequelize, DataTypes) => {
  const AuditLog = sequelize.define('AuditLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resource_type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    resource_id: {
      type: DataTypes.UUID
    },
    old_values: {
      type: DataTypes.JSONB
    },
    new_values: {
      type: DataTypes.JSONB
    },
    ip_address: {
      type: DataTypes.INET
    },
    user_agent: {
      type: DataTypes.TEXT
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'audit_logs',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['resource_type']
      },
      {
        fields: ['resource_id']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Class methods
  AuditLog.logAction = function(userId, action, resourceType, resourceId, oldValues = null, newValues = null, metadata = {}) {
    return this.create({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      old_values: oldValues,
      new_values: newValues,
      metadata
    });
  };

  AuditLog.logCreate = function(userId, resourceType, resourceId, values, metadata = {}) {
    return this.logAction(userId, 'CREATE', resourceType, resourceId, null, values, metadata);
  };

  AuditLog.logUpdate = function(userId, resourceType, resourceId, oldValues, newValues, metadata = {}) {
    return this.logAction(userId, 'UPDATE', resourceType, resourceId, oldValues, newValues, metadata);
  };

  AuditLog.logDelete = function(userId, resourceType, resourceId, values, metadata = {}) {
    return this.logAction(userId, 'DELETE', resourceType, resourceId, values, null, metadata);
  };

  AuditLog.logLogin = function(userId, metadata = {}) {
    return this.logAction(userId, 'LOGIN', 'user', userId, null, null, metadata);
  };

  AuditLog.logLogout = function(userId, metadata = {}) {
    return this.logAction(userId, 'LOGOUT', 'user', userId, null, null, metadata);
  };

  return AuditLog;
};