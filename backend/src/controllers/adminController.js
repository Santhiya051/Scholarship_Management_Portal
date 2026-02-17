const { User, Role, Student, Scholarship, Application, Payment, Notification, AuditLog } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

const adminController = {
  // Dashboard Stats
  getDashboardStats: async (req, res) => {
    try {
      const [
        totalUsers,
        totalScholarships,
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications,
        totalPayments
      ] = await Promise.all([
        User.count(),
        Scholarship.count(),
        Application.count(),
        Application.count({ where: { status: 'approved' } }),
        Application.count({ where: { status: 'rejected' } }),
        Application.count({ where: { status: { [Op.in]: ['submitted', 'under_review'] } } }),
        Payment.sum('amount', { where: { status: 'completed' } })
      ]);

      const stats = {
        totalUsers,
        totalScholarships,
        totalApplications,
        approvedApplications,
        rejectedApplications,
        pendingApplications,
        totalAwarded: totalPayments || 0,
        averageAwardAmount: totalPayments && approvedApplications ? 
          Math.round(totalPayments / approvedApplications) : 0
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard statistics'
      });
    }
  },

  // Get all roles
  getAllRoles: async (req, res) => {
    try {
      const roles = await Role.findAll({
        where: { is_active: true },
        attributes: ['id', 'name', 'display_name', 'description'],
        order: [['name', 'ASC']]
      });

      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch roles'
      });
    }
  },

  // User Management
  getAllUsers: async (req, res) => {
    try {
      const { page = 1, limit = 50, search, role, status } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }
      if (status) {
        whereClause.is_active = status === 'active';
      }

      const roleWhere = role ? { name: role } : {};

      const users = await User.findAndCountAll({
        where: whereClause,
        include: [{
          model: Role,
          as: 'role',
          where: roleWhere
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: users.rows,
        pagination: {
          total: users.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(users.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  },

  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await User.findByPk(id, {
        include: [{
          model: Role,
          as: 'role'
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  },

  createUser: async (req, res) => {
    try {
      const { first_name, last_name, email, phone, password, role_id, is_active = true, email_verified = false } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        first_name,
        last_name,
        email,
        phone,
        password: hashedPassword,
        role_id,
        is_active,
        email_verified
      });

      // If user is a student, create student record
      if (role_id === 1) { // Assuming role_id 1 is student
        await Student.create({
          user_id: user.id,
          student_id: `STU${Date.now()}`,
          department: 'Undeclared',
          major: 'Undeclared',
          year_of_study: 1,
          enrollment_date: new Date()
        });
      }

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'CREATE_USER',
        resource_type: 'User',
        resource_id: user.id,
        new_values: { email, role_id },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      const userWithRole = await User.findByPk(user.id, {
        include: [{ model: Role, as: 'role' }]
      });

      res.status(201).json({
        success: true,
        data: userWithRole,
        message: 'User created successfully'
      });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  },

  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Store old values for audit
      const oldValues = {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role_id: user.role_id,
        is_active: user.is_active
      };

      // Hash password if provided
      if (updates.password) {
        updates.password = await bcrypt.hash(updates.password, 12);
      }

      await user.update(updates);

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'UPDATE_USER',
        resource_type: 'User',
        resource_id: user.id,
        old_values: oldValues,
        new_values: updates,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      const updatedUser = await User.findByPk(id, {
        include: [{ model: Role, as: 'role' }]
      });

      res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Soft delete
      await user.update({ deleted_at: new Date() });

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'DELETE_USER',
        resource_type: 'User',
        resource_id: user.id,
        old_values: { email: user.email, is_active: user.is_active },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  },

  // Scholarship Management
  getAllScholarshipsAdmin: async (req, res) => {
    try {
      const { page = 1, limit = 50, search, status, department } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }
      if (status) whereClause.status = status;
      if (department && department !== 'all') whereClause.department = department;

      const scholarships = await Scholarship.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'first_name', 'last_name', 'email']
          },
          {
            model: Application,
            as: 'applications',
            required: false,
            attributes: ['id', 'status']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      // Add application counts to each scholarship
      const scholarshipsWithCounts = scholarships.rows.map(scholarship => {
        const applications = scholarship.applications || [];
        return {
          ...scholarship.toJSON(),
          application_count: applications.length,
          approved_count: applications.filter(app => app.status === 'approved').length,
          pending_count: applications.filter(app => ['submitted', 'under_review'].includes(app.status)).length
        };
      });

      res.json({
        success: true,
        data: scholarshipsWithCounts,
        pagination: {
          total: scholarships.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(scholarships.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch scholarships'
      });
    }
  },

  createScholarshipAdmin: async (req, res) => {
    try {
      const scholarshipData = {
        ...req.body,
        created_by: req.user.id
      };

      const scholarship = await Scholarship.create(scholarshipData);

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'CREATE_SCHOLARSHIP',
        resource_type: 'Scholarship',
        resource_id: scholarship.id,
        new_values: scholarshipData,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      const scholarshipWithCreator = await Scholarship.findByPk(scholarship.id, {
        include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] }]
      });

      res.status(201).json({
        success: true,
        data: scholarshipWithCreator,
        message: 'Scholarship created successfully'
      });
    } catch (error) {
      console.error('Error creating scholarship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create scholarship'
      });
    }
  },

  updateScholarshipAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const scholarship = await Scholarship.findByPk(id);
      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: 'Scholarship not found'
        });
      }

      // Store old values for audit
      const oldValues = {
        name: scholarship.name,
        status: scholarship.status,
        amount: scholarship.amount,
        max_recipients: scholarship.max_recipients
      };

      await scholarship.update(updates);

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'UPDATE_SCHOLARSHIP',
        resource_type: 'Scholarship',
        resource_id: scholarship.id,
        old_values: oldValues,
        new_values: updates,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      const updatedScholarship = await Scholarship.findByPk(id, {
        include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] }]
      });

      res.json({
        success: true,
        data: updatedScholarship,
        message: 'Scholarship updated successfully'
      });
    } catch (error) {
      console.error('Error updating scholarship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update scholarship'
      });
    }
  },

  deleteScholarshipAdmin: async (req, res) => {
    try {
      const { id } = req.params;

      const scholarship = await Scholarship.findByPk(id);
      if (!scholarship) {
        return res.status(404).json({
          success: false,
          message: 'Scholarship not found'
        });
      }

      // Soft delete
      await scholarship.update({ deleted_at: new Date() });

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'DELETE_SCHOLARSHIP',
        resource_type: 'Scholarship',
        resource_id: scholarship.id,
        old_values: { name: scholarship.name, status: scholarship.status },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'Scholarship deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting scholarship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete scholarship'
      });
    }
  },

  // Application Management
  getAllApplicationsAdmin: async (req, res) => {
    try {
      const { page = 1, limit = 50, status, scholarship_id, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (scholarship_id) whereClause.scholarship_id = scholarship_id;

      const applications = await Application.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Student,
            as: 'student',
            include: [{
              model: User,
              as: 'user',
              where: search ? {
                [Op.or]: [
                  { first_name: { [Op.iLike]: `%${search}%` } },
                  { last_name: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } }
                ]
              } : {}
            }]
          },
          {
            model: Scholarship,
            as: 'scholarship'
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: applications.rows,
        pagination: {
          total: applications.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(applications.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications'
      });
    }
  },

  reviewApplication: async (req, res) => {
    try {
      const { id } = req.params;
      const { action, comments, score } = req.body;

      const application = await Application.findByPk(id);
      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Application not found'
        });
      }

      const oldStatus = application.status;
      const newStatus = action === 'approved' ? 'approved' : 
                      action === 'rejected' ? 'rejected' : 'under_review';

      await application.update({
        status: newStatus,
        score: score ? parseFloat(score) : application.score,
        notes: comments,
        reviewed_at: new Date()
      });

      // Create notification for student
      const student = await Student.findByPk(application.student_id, {
        include: [{ model: User, as: 'user' }]
      });

      if (student) {
        await Notification.create({
          user_id: student.user.id,
          type: `application_${newStatus}`,
          title: `Application ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          message: `Your application has been ${newStatus}. ${comments || ''}`,
          data: { application_id: application.id }
        });
      }

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'REVIEW_APPLICATION',
        resource_type: 'Application',
        resource_id: application.id,
        old_values: { status: oldStatus },
        new_values: { status: newStatus, score, comments },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: application,
        message: 'Application reviewed successfully'
      });
    } catch (error) {
      console.error('Error reviewing application:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review application'
      });
    }
  },

  // Analytics
  getAnalyticsData: async (req, res) => {
    try {
      const { date_range = 'last_30_days' } = req.query;
      
      let dateFilter = {};
      const now = new Date();
      
      switch (date_range) {
        case 'last_7_days':
          dateFilter = { [Op.gte]: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case 'last_30_days':
          dateFilter = { [Op.gte]: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case 'last_90_days':
          dateFilter = { [Op.gte]: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
        case 'last_year':
          dateFilter = { [Op.gte]: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
          break;
        default:
          dateFilter = {};
      }

      const [
        applicationTrends,
        departmentStats,
        statusDistribution,
        topScholarships
      ] = await Promise.all([
        // Application trends by month
        Application.findAll({
          where: { created_at: dateFilter },
          attributes: [
            [Application.sequelize.fn('DATE_TRUNC', 'month', Application.sequelize.col('created_at')), 'month'],
            [Application.sequelize.fn('COUNT', '*'), 'applications'],
            [Application.sequelize.fn('COUNT', Application.sequelize.literal("CASE WHEN status = 'approved' THEN 1 END")), 'approved']
          ],
          group: [Application.sequelize.fn('DATE_TRUNC', 'month', Application.sequelize.col('created_at'))],
          order: [[Application.sequelize.fn('DATE_TRUNC', 'month', Application.sequelize.col('created_at')), 'ASC']]
        }),

        // Department distribution
        Student.findAll({
          attributes: [
            'department',
            [Student.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['department'],
          order: [[Student.sequelize.fn('COUNT', '*'), 'DESC']]
        }),

        // Status distribution
        Application.findAll({
          where: { created_at: dateFilter },
          attributes: [
            'status',
            [Application.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['status']
        }),

        // Top performing scholarships
        Scholarship.findAll({
          include: [{
            model: Application,
            as: 'applications',
            where: { created_at: dateFilter },
            required: false
          }],
          attributes: [
            'id', 'name', 'amount',
            [Scholarship.sequelize.fn('COUNT', Scholarship.sequelize.col('applications.id')), 'application_count'],
            [Scholarship.sequelize.fn('COUNT', Scholarship.sequelize.literal("CASE WHEN applications.status = 'approved' THEN 1 END")), 'approved_count']
          ],
          group: ['Scholarship.id'],
          order: [[Scholarship.sequelize.fn('COUNT', Scholarship.sequelize.col('applications.id')), 'DESC']],
          limit: 10
        })
      ]);

      res.json({
        success: true,
        data: {
          applicationTrends,
          departmentStats,
          statusDistribution,
          topScholarships
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics data'
      });
    }
  },

  // Bulk Operations
  bulkReviewApplications: async (req, res) => {
    try {
      const { application_ids, action, comments } = req.body;

      if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Application IDs are required'
        });
      }

      const newStatus = action === 'approved' ? 'approved' : 
                      action === 'rejected' ? 'rejected' : 'under_review';

      await Application.update(
        {
          status: newStatus,
          notes: comments,
          reviewed_at: new Date()
        },
        {
          where: { id: { [Op.in]: application_ids } }
        }
      );

      // Log the bulk action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'BULK_REVIEW_APPLICATIONS',
        resource_type: 'Application',
        new_values: { application_ids, status: newStatus, comments },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `${application_ids.length} applications reviewed successfully`
      });
    } catch (error) {
      console.error('Error bulk reviewing applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk review applications'
      });
    }
  },

  // Payment Management
  getAllPayments: async (req, res) => {
    try {
      const { page = 1, limit = 50, status, search } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;

      const payments = await Payment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Application,
            as: 'application',
            include: [
              {
                model: Student,
                as: 'student',
                include: [{
                  model: User,
                  as: 'user',
                  attributes: ['id', 'first_name', 'last_name', 'email'],
                  where: search ? {
                    [Op.or]: [
                      { first_name: { [Op.iLike]: `%${search}%` } },
                      { last_name: { [Op.iLike]: `%${search}%` } },
                      { email: { [Op.iLike]: `%${search}%` } }
                    ]
                  } : {}
                }]
              },
              {
                model: Scholarship,
                as: 'scholarship',
                attributes: ['id', 'name', 'amount']
              }
            ]
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: payments.rows,
        pagination: {
          total: payments.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(payments.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments'
      });
    }
  },

  processPayment: async (req, res) => {
    try {
      const { id } = req.params;
      const { payment_method, reference_number, notes } = req.body;

      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      await payment.update({
        status: 'completed',
        payment_method,
        reference_number,
        notes,
        processed_by: req.user.id,
        processed_at: new Date()
      });

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'PROCESS_PAYMENT',
        resource_type: 'Payment',
        resource_id: payment.id,
        new_values: { payment_method, reference_number, notes },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        data: payment,
        message: 'Payment processed successfully'
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment'
      });
    }
  },

  bulkProcessPayments: async (req, res) => {
    try {
      const { payment_ids, payment_method, notes } = req.body;

      await Payment.update(
        {
          status: 'completed',
          payment_method,
          notes,
          processed_by: req.user.id,
          processed_at: new Date()
        },
        {
          where: { id: { [Op.in]: payment_ids } }
        }
      );

      // Log the bulk action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'BULK_PROCESS_PAYMENTS',
        resource_type: 'Payment',
        new_values: { payment_ids, payment_method, notes },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `${payment_ids.length} payments processed successfully`
      });
    } catch (error) {
      console.error('Error bulk processing payments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to bulk process payments'
      });
    }
  },

  // Notification Management
  getNotificationTemplates: async (req, res) => {
    try {
      const { page = 1, limit = 50, type } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (type) whereClause.type = type;

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name', 'email']
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        success: true,
        data: notifications.rows,
        pagination: {
          total: notifications.count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(notifications.count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  },

  sendBulkNotification: async (req, res) => {
    try {
      const { type, title, message, priority, target_roles, expires_at, action_url } = req.body;

      // Get users based on target roles
      const users = await User.findAll({
        include: [{
          model: Role,
          as: 'role',
          where: { name: { [Op.in]: target_roles } }
        }],
        where: { is_active: true }
      });

      // Create notifications for all target users
      const notifications = users.map(user => ({
        user_id: user.id,
        type,
        title,
        message,
        priority,
        expires_at: expires_at || null,
        action_url: action_url || null,
        data: { sent_by: req.user.id }
      }));

      await Notification.bulkCreate(notifications);

      // Log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'SEND_BULK_NOTIFICATION',
        resource_type: 'Notification',
        new_values: { type, title, target_roles, recipient_count: users.length },
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: `Notification sent to ${users.length} users`,
        data: { recipient_count: users.length }
      });
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification'
      });
    }
  },

  // System Settings
  getSystemSettings: async (req, res) => {
    try {
      // In a real implementation, you would store settings in a database table
      // For now, return default settings
      const settings = {
        general: {
          site_name: process.env.SITE_NAME || 'ScholarPortal',
          site_description: process.env.SITE_DESCRIPTION || 'Scholarship Management System',
          admin_email: process.env.ADMIN_EMAIL || 'admin@scholarportal.com',
          support_email: process.env.SUPPORT_EMAIL || 'support@scholarportal.com',
          timezone: process.env.TIMEZONE || 'UTC',
          language: process.env.LANGUAGE || 'en'
        },
        application: {
          max_file_size: parseInt(process.env.MAX_FILE_SIZE) || 10,
          allowed_file_types: (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,png').split(','),
          auto_approve_threshold: parseInt(process.env.AUTO_APPROVE_THRESHOLD) || 85,
          require_email_verification: process.env.REQUIRE_EMAIL_VERIFICATION === 'true',
          enable_notifications: process.env.ENABLE_NOTIFICATIONS !== 'false'
        },
        email: {
          smtp_host: process.env.SMTP_HOST || '',
          smtp_port: parseInt(process.env.SMTP_PORT) || 587,
          smtp_username: process.env.SMTP_USERNAME || '',
          from_email: process.env.FROM_EMAIL || '',
          from_name: process.env.FROM_NAME || 'ScholarPortal'
        },
        security: {
          session_timeout: parseInt(process.env.SESSION_TIMEOUT) || 30,
          password_min_length: parseInt(process.env.PASSWORD_MIN_LENGTH) || 8,
          require_strong_passwords: process.env.REQUIRE_STRONG_PASSWORDS !== 'false',
          enable_two_factor: process.env.ENABLE_TWO_FACTOR === 'true',
          login_attempts_limit: parseInt(process.env.LOGIN_ATTEMPTS_LIMIT) || 5
        }
      };

      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Error fetching system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system settings'
      });
    }
  },

  updateSystemSettings: async (req, res) => {
    try {
      const settings = req.body;

      // In a real implementation, you would save these to a database
      // For now, just log the action
      await AuditLog.create({
        user_id: req.user.id,
        action: 'UPDATE_SYSTEM_SETTINGS',
        resource_type: 'SystemSettings',
        new_values: settings,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        success: true,
        message: 'System settings updated successfully'
      });
    } catch (error) {
      console.error('Error updating system settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update system settings'
      });
    }
  }
};

module.exports = adminController;