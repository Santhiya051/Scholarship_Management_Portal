module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define('Student', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    student_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    department: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['computer-science', 'engineering', 'business', 'medicine', 'arts', 'sciences']]
      }
    },
    major: {
      type: DataTypes.STRING,
      allowNull: false
    },
    year_of_study: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 6
      }
    },
    gpa: {
      type: DataTypes.DECIMAL(3, 2),
      validate: {
        min: 0.0,
        max: 4.0
      }
    },
    enrollment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    graduation_date: {
      type: DataTypes.DATE
    },
    address: {
      type: DataTypes.JSONB
    },
    emergency_contact: {
      type: DataTypes.JSONB
    },
    financial_need_score: {
      type: DataTypes.INTEGER,
      validate: {
        min: 0,
        max: 100
      }
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'students',
    indexes: [
      {
        unique: true,
        fields: ['student_id']
      },
      {
        unique: true,
        fields: ['user_id']
      },
      {
        fields: ['department']
      },
      {
        fields: ['year_of_study']
      },
      {
        fields: ['gpa']
      }
    ]
  });

  // Instance methods
  Student.prototype.getAcademicYear = function() {
    const years = {
      1: '1st Year',
      2: '2nd Year', 
      3: '3rd Year',
      4: '4th Year',
      5: 'Graduate',
      6: 'PhD'
    };
    return years[this.year_of_study] || 'Unknown';
  };

  Student.prototype.isEligibleForScholarship = function(scholarship) {
    // Basic eligibility check - can be extended
    if (scholarship.min_gpa && this.gpa < scholarship.min_gpa) {
      return false;
    }
    
    if (scholarship.department && scholarship.department !== 'all' && 
        scholarship.department !== this.department) {
      return false;
    }
    
    if (scholarship.year_of_study && 
        !scholarship.year_of_study.includes(this.year_of_study)) {
      return false;
    }
    
    return true;
  };

  return Student;
};