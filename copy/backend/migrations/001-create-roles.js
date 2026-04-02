'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('roles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      display_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      permissions: {
        type: Sequelize.JSONB,
        defaultValue: []
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deleted_at: {
        type: Sequelize.DATE
      }
    });

    // Insert default roles
    const roles = [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'student',
        display_name: 'Student',
        description: 'Student users who can apply for scholarships',
        permissions: JSON.stringify(['apply_scholarship', 'view_own_applications', 'upload_documents']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'coordinator',
        display_name: 'Department Coordinator',
        description: 'Department coordinators who manage scholarships and initial reviews',
        permissions: JSON.stringify(['manage_scholarships', 'review_applications', 'view_department_data']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'committee',
        display_name: 'Scholarship Committee',
        description: 'Committee members who evaluate scholarship applications',
        permissions: JSON.stringify(['review_applications', 'score_applications', 'view_all_applications']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'finance',
        display_name: 'Finance Officer',
        description: 'Finance officers who handle payments and disbursements',
        permissions: JSON.stringify(['process_payments', 'view_financial_reports', 'manage_disbursements']),
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: Sequelize.literal('gen_random_uuid()'),
        name: 'admin',
        display_name: 'Administrator',
        description: 'System administrators with full access',
        permissions: JSON.stringify(['*']),
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    await queryInterface.bulkInsert('roles', roles);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('roles');
  }
};