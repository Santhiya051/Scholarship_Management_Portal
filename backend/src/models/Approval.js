module.exports = (sequelize, DataTypes) => {
  const Approval = sequelize.define('Approval', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    application_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'applications',
        key: 'id'
      }
    },
    approval_step: {
      type: DataTypes.ENUM('coordinator', 'committee', 'finance', 'admin'),
      allowNull: false
    },
    reviewed_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    action: {
      type: DataTypes.ENUM('approved', 'rejected', 'returned'),
      allowNull: false
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0,
        max: 100
      }
    },
    comments: {
      type: DataTypes.TEXT
    },
    criteria_scores: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    reviewed_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    time_spent_minutes: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0
      }
    }
  }, {
    tableName: 'approvals',
    indexes: [
      {
        fields: ['application_id']
      },
      {
        fields: ['approval_step']
      },
      {
        fields: ['reviewed_by']
      },
      {
        fields: ['action']
      },
      {
        fields: ['reviewed_at']
      }
    ]
  });

  // Instance methods
  Approval.prototype.isApproved = function() {
    return this.action === 'approved';
  };

  Approval.prototype.isRejected = function() {
    return this.action === 'rejected';
  };

  Approval.prototype.isReturned = function() {
    return this.action === 'returned';
  };

  // Class methods
  Approval.getApprovalWorkflow = function() {
    return ['coordinator', 'committee', 'finance'];
  };

  Approval.getNextApprovalStep = function(currentStep) {
    const workflow = this.getApprovalWorkflow();
    const currentIndex = workflow.indexOf(currentStep);
    
    if (currentIndex === -1 || currentIndex === workflow.length - 1) {
      return null; // No next step
    }
    
    return workflow[currentIndex + 1];
  };

  return Approval;
};