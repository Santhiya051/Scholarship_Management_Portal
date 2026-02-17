module.exports = (sequelize, DataTypes) => {
  const Scholarship = sequelize.define('Scholarship', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [3, 200]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    total_funding: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    max_recipients: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1
      }
    },
    current_recipients: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    application_deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    award_date: {
      type: DataTypes.DATE
    },
    academic_year: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.STRING,
      defaultValue: 'all',
      validate: {
        isIn: [['all', 'computer-science', 'engineering', 'business', 'medicine', 'arts', 'sciences']]
      }
    },
    min_gpa: {
      type: DataTypes.DECIMAL(3, 2),
      validate: {
        min: 0.0,
        max: 4.0
      }
    },
    year_of_study: {
      type: DataTypes.JSONB,
      defaultValue: [1, 2, 3, 4]
    },
    requirements: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    criteria: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'closed', 'cancelled'),
      defaultValue: 'draft'
    },
    is_renewable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    renewal_criteria: {
      type: DataTypes.JSONB
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    approval_workflow: {
      type: DataTypes.JSONB,
      defaultValue: ['coordinator', 'committee', 'finance']
    }
  }, {
    tableName: 'scholarships',
    indexes: [
      {
        fields: ['status']
      },
      {
        fields: ['department']
      },
      {
        fields: ['application_deadline']
      },
      {
        fields: ['academic_year']
      },
      {
        fields: ['created_by']
      }
    ]
  });

  // Instance methods
  Scholarship.prototype.isActive = function() {
    return this.status === 'active' && 
           new Date() < new Date(this.application_deadline);
  };

  Scholarship.prototype.hasAvailableSlots = function() {
    return this.current_recipients < this.max_recipients;
  };

  Scholarship.prototype.getRemainingFunding = function() {
    return this.total_funding - (this.current_recipients * this.amount);
  };

  Scholarship.prototype.canAcceptMoreApplications = function() {
    return this.isActive() && this.hasAvailableSlots();
  };

  // Class methods
  Scholarship.getActiveScholarships = function() {
    return this.findAll({
      where: {
        status: 'active',
        application_deadline: {
          [sequelize.Op.gt]: new Date()
        }
      }
    });
  };

  return Scholarship;
};