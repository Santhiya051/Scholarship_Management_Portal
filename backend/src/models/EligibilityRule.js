module.exports = (sequelize, DataTypes) => {
  const EligibilityRule = sequelize.define('EligibilityRule', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    scholarship_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'scholarships',
        key: 'id'
      }
    },
    rule_type: {
      type: DataTypes.ENUM(
        'gpa_minimum',
        'department',
        'year_of_study',
        'financial_need',
        'academic_achievement',
        'extracurricular',
        'custom'
      ),
      allowNull: false
    },
    operator: {
      type: DataTypes.ENUM('equals', 'greater_than', 'less_than', 'in', 'not_in', 'contains'),
      allowNull: false
    },
    value: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    is_required: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    weight: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      validate: {
        min: 1,
        max: 10
      }
    }
  }, {
    tableName: 'eligibility_rules',
    indexes: [
      {
        fields: ['scholarship_id']
      },
      {
        fields: ['rule_type']
      }
    ]
  });

  // Instance methods
  EligibilityRule.prototype.evaluate = function(student) {
    const { rule_type, operator, value } = this;
    
    let studentValue;
    
    switch (rule_type) {
      case 'gpa_minimum':
        studentValue = student.gpa;
        break;
      case 'department':
        studentValue = student.department;
        break;
      case 'year_of_study':
        studentValue = student.year_of_study;
        break;
      case 'financial_need':
        studentValue = student.financial_need_score;
        break;
      default:
        return true; // Unknown rule types pass by default
    }
    
    switch (operator) {
      case 'equals':
        return studentValue === value;
      case 'greater_than':
        return studentValue > value;
      case 'less_than':
        return studentValue < value;
      case 'in':
        return Array.isArray(value) && value.includes(studentValue);
      case 'not_in':
        return Array.isArray(value) && !value.includes(studentValue);
      case 'contains':
        return String(studentValue).toLowerCase().includes(String(value).toLowerCase());
      default:
        return false;
    }
  };

  return EligibilityRule;
};