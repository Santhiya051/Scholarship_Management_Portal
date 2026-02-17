module.exports = (sequelize, DataTypes) => {
  const Application = sequelize.define('Application', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id'
      }
    },
    scholarship_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'scholarships',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM(
        'draft', 
        'submitted', 
        'under_review', 
        'pending_documents', 
        'approved', 
        'rejected', 
        'withdrawn'
      ),
      defaultValue: 'draft'
    },
    personal_info: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    academic_info: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    essays: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    financial_info: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    submitted_at: {
      type: DataTypes.DATE
    },
    reviewed_at: {
      type: DataTypes.DATE
    },
    decision_date: {
      type: DataTypes.DATE
    },
    score: {
      type: DataTypes.DECIMAL(5, 2),
      validate: {
        min: 0,
        max: 100
      }
    },
    ranking: {
      type: DataTypes.INTEGER
    },
    notes: {
      type: DataTypes.TEXT
    },
    rejection_reason: {
      type: DataTypes.TEXT
    },
    current_approval_step: {
      type: DataTypes.STRING,
      defaultValue: 'coordinator'
    },
    approval_history: {
      type: DataTypes.JSONB,
      defaultValue: []
    }
  }, {
    tableName: 'applications',
    indexes: [
      {
        unique: true,
        fields: ['student_id', 'scholarship_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['submitted_at']
      },
      {
        fields: ['score']
      },
      {
        fields: ['current_approval_step']
      }
    ]
  });

  // Instance methods
  Application.prototype.canBeEdited = function() {
    return ['draft', 'pending_documents'].includes(this.status);
  };

  Application.prototype.canBeSubmitted = function() {
    return this.status === 'draft';
  };

  Application.prototype.canBeWithdrawn = function() {
    return ['submitted', 'under_review', 'pending_documents'].includes(this.status);
  };

  Application.prototype.submit = function() {
    if (!this.canBeSubmitted()) {
      throw new Error('Application cannot be submitted in current status');
    }
    
    this.status = 'submitted';
    this.submitted_at = new Date();
    this.current_approval_step = 'coordinator';
    
    return this.save();
  };

  Application.prototype.approve = function(reviewerId, comments = '') {
    const approvalStep = {
      step: this.current_approval_step,
      reviewer_id: reviewerId,
      action: 'approved',
      comments: comments,
      timestamp: new Date()
    };

    this.approval_history = [...(this.approval_history || []), approvalStep];
    
    // Move to next approval step or mark as approved
    const workflow = ['coordinator', 'committee', 'finance'];
    const currentIndex = workflow.indexOf(this.current_approval_step);
    
    if (currentIndex < workflow.length - 1) {
      this.current_approval_step = workflow[currentIndex + 1];
      this.status = 'under_review';
    } else {
      this.status = 'approved';
      this.decision_date = new Date();
      this.current_approval_step = null;
    }
    
    return this.save();
  };

  Application.prototype.reject = function(reviewerId, reason = '') {
    const approvalStep = {
      step: this.current_approval_step,
      reviewer_id: reviewerId,
      action: 'rejected',
      comments: reason,
      timestamp: new Date()
    };

    this.approval_history = [...(this.approval_history || []), approvalStep];
    this.status = 'rejected';
    this.rejection_reason = reason;
    this.decision_date = new Date();
    this.current_approval_step = null;
    
    return this.save();
  };

  Application.prototype.getStatusDisplay = function() {
    const statusMap = {
      'draft': 'Draft',
      'submitted': 'Submitted',
      'under_review': 'Under Review',
      'pending_documents': 'Pending Documents',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'withdrawn': 'Withdrawn'
    };
    
    return statusMap[this.status] || this.status;
  };

  return Application;
};