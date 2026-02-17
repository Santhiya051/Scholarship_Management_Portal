const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// Import all models
const User = require('./User')(sequelize, DataTypes);
const Role = require('./Role')(sequelize, DataTypes);
const Student = require('./Student')(sequelize, DataTypes);
const Scholarship = require('./Scholarship')(sequelize, DataTypes);
const EligibilityRule = require('./EligibilityRule')(sequelize, DataTypes);
const Application = require('./Application')(sequelize, DataTypes);
const Document = require('./Document')(sequelize, DataTypes);
const Approval = require('./Approval')(sequelize, DataTypes);
const Payment = require('./Payment')(sequelize, DataTypes);
const Notification = require('./Notification')(sequelize, DataTypes);
const AuditLog = require('./AuditLog')(sequelize, DataTypes);

// Define associations
const defineAssociations = () => {
  // User associations
  User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
  Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });

  // Student associations
  Student.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  User.hasOne(Student, { foreignKey: 'user_id', as: 'student' });

  // Scholarship associations
  Scholarship.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
  Scholarship.hasMany(EligibilityRule, { foreignKey: 'scholarship_id', as: 'eligibilityRules' });
  Scholarship.hasMany(Application, { foreignKey: 'scholarship_id', as: 'applications' });

  // EligibilityRule associations
  EligibilityRule.belongsTo(Scholarship, { foreignKey: 'scholarship_id', as: 'scholarship' });

  // Application associations
  Application.belongsTo(Student, { foreignKey: 'student_id', as: 'student' });
  Application.belongsTo(Scholarship, { foreignKey: 'scholarship_id', as: 'scholarship' });
  Application.hasMany(Document, { foreignKey: 'application_id', as: 'documents' });
  Application.hasMany(Approval, { foreignKey: 'application_id', as: 'approvals' });
  Application.hasOne(Payment, { foreignKey: 'application_id', as: 'payment' });

  // Document associations
  Document.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
  Document.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

  // Approval associations
  Approval.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
  Approval.belongsTo(User, { foreignKey: 'reviewed_by', as: 'reviewer' });

  // Payment associations
  Payment.belongsTo(Application, { foreignKey: 'application_id', as: 'application' });
  Payment.belongsTo(User, { foreignKey: 'processed_by', as: 'processor' });

  // Notification associations
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // AuditLog associations
  AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
};

defineAssociations();

module.exports = {
  sequelize,
  User,
  Role,
  Student,
  Scholarship,
  EligibilityRule,
  Application,
  Document,
  Approval,
  Payment,
  Notification,
  AuditLog
};