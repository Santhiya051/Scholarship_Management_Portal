module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    type: {
      type: DataTypes.ENUM(
        'application_submitted',
        'application_approved',
        'application_rejected',
        'document_required',
        'payment_processed',
        'deadline_reminder',
        'system_announcement',
        'other'
      ),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    expires_at: {
      type: DataTypes.DATE
    },
    action_url: {
      type: DataTypes.STRING
    },
    email_sent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    email_sent_at: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'notifications',
    indexes: [
      {
        fields: ['user_id']
      },
      {
        fields: ['type']
      },
      {
        fields: ['is_read']
      },
      {
        fields: ['priority']
      },
      {
        fields: ['created_at']
      }
    ]
  });

  // Instance methods
  Notification.prototype.markAsRead = function() {
    this.is_read = true;
    this.read_at = new Date();
    
    return this.save();
  };

  Notification.prototype.isExpired = function() {
    return this.expires_at && new Date() > new Date(this.expires_at);
  };

  Notification.prototype.shouldSendEmail = function() {
    return !this.email_sent && ['high', 'urgent'].includes(this.priority);
  };

  Notification.prototype.markEmailSent = function() {
    this.email_sent = true;
    this.email_sent_at = new Date();
    
    return this.save();
  };

  // Class methods
  Notification.createForUser = function(userId, type, title, message, data = {}, options = {}) {
    return this.create({
      user_id: userId,
      type,
      title,
      message,
      data,
      priority: options.priority || 'medium',
      expires_at: options.expiresAt,
      action_url: options.actionUrl
    });
  };

  Notification.createApplicationNotification = function(applicationId, userId, type, customMessage = null) {
    const messages = {
      'application_submitted': 'Your scholarship application has been submitted successfully.',
      'application_approved': 'Congratulations! Your scholarship application has been approved.',
      'application_rejected': 'Your scholarship application has been reviewed and unfortunately was not approved.',
      'document_required': 'Additional documents are required for your scholarship application.'
    };

    const titles = {
      'application_submitted': 'Application Submitted',
      'application_approved': 'Application Approved',
      'application_rejected': 'Application Decision',
      'document_required': 'Documents Required'
    };

    return this.createForUser(
      userId,
      type,
      titles[type],
      customMessage || messages[type],
      { application_id: applicationId },
      {
        priority: type === 'application_approved' ? 'high' : 'medium',
        actionUrl: `/applications/${applicationId}`
      }
    );
  };

  Notification.getUnreadCount = function(userId) {
    return this.count({
      where: {
        user_id: userId,
        is_read: false
      }
    });
  };

  return Notification;
};