const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validate, userSchemas, querySchemas } = require('../middlewares/validation');
const { auditLogger } = require('../middlewares/security');
const { User, Role, Student, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Get all users (admin only)
router.get('/',
  authenticateToken,
  requireRole(['admin']),
  validate(querySchemas.pagination, 'query'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'created_at',
        order = 'DESC',
        role,
        is_active,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (is_active !== undefined) {
        whereClause.is_active = is_active === 'true';
      }

      if (search) {
        whereClause[Op.or] = [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const includeClause = [
        {
          model: Role,
          as: 'role'
        }
      ];

      // Filter by role if specified
      if (role) {
        includeClause[0].where = { name: role };
      }

      // Include student info for student users
      includeClause.push({
        model: Student,
        as: 'student',
        required: false
      });

      const { count, rows: users } = await User.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: { exclude: ['password'] }
      });

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }
);

// Get single user (admin only)
router.get('/:id',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        include: [
          {
            model: Role,
            as: 'role'
          },
          {
            model: Student,
            as: 'student'
          }
        ],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }
);

// Create user (admin only)
router.post('/',
  authenticateToken,
  requireRole(['admin']),
  validate(userSchemas.register),
  auditLogger('CREATE', 'user'),
  async (req, res) => {
    try {
      const {
        email,
        password,
        first_name,
        last_name,
        phone,
        role_name,
        student_id,
        department,
        major,
        year_of_study,
        gpa
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      // Get role
      const role = await Role.findOne({ where: { name: role_name } });
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        first_name,
        last_name,
        phone,
        role_id: role.id,
        email_verified: true // Admin-created users are pre-verified
      });

      // Create student profile if role is student
      if (role_name === 'student') {
        if (!student_id || !department || !major || !year_of_study) {
          return res.status(400).json({
            success: false,
            message: 'Student ID, department, major, and year of study are required for student users'
          });
        }

        // Check if student ID already exists
        const existingStudent = await Student.findOne({ where: { student_id } });
        if (existingStudent) {
          await user.destroy(); // Rollback user creation
          return res.status(409).json({
            success: false,
            message: 'Student ID already exists'
          });
        }

        await Student.create({
          user_id: user.id,
          student_id,
          department,
          major,
          year_of_study,
          gpa: gpa || null,
          enrollment_date: new Date()
        });
      }

      // Get user with role for response
      const userWithRole = await User.findByPk(user.id, {
        include: [
          {
            model: Role,
            as: 'role'
          },
          {
            model: Student,
            as: 'student'
          }
        ],
        attributes: { exclude: ['password'] }
      });

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: userWithRole }
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }
);

// Update user (admin only)
router.put('/:id',
  authenticateToken,
  requireRole(['admin']),
  validate(userSchemas.updateProfile),
  auditLogger('UPDATE', 'user'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { first_name, last_name, phone, gpa } = req.body;

      const user = await User.findByPk(id, {
        include: [{
          model: Student,
          as: 'student'
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const oldValues = {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone
      };

      // Update user
      await user.update({
        first_name: first_name || user.first_name,
        last_name: last_name || user.last_name,
        phone: phone || user.phone
      });

      // Update student GPA if provided and user is a student
      if (gpa !== undefined && user.student) {
        await user.student.update({ gpa });
      }

      // Get updated user
      const updatedUser = await User.findByPk(user.id, {
        include: [
          {
            model: Role,
            as: 'role'
          },
          {
            model: Student,
            as: 'student'
          }
        ],
        attributes: { exclude: ['password'] }
      });

      res.json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }
);

// Update user status (activate/deactivate)
router.put('/:id/status',
  authenticateToken,
  requireRole(['admin']),
  auditLogger('UPDATE_STATUS', 'user'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'is_active must be a boolean value'
        });
      }

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from deactivating themselves
      if (user.id === req.user.id && !is_active) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own account'
        });
      }

      await user.update({ is_active });

      res.json({
        success: true,
        message: `User ${is_active ? 'activated' : 'deactivated'} successfully`,
        data: { user: { id: user.id, is_active } }
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }
);

// Delete user (admin only)
router.delete('/:id',
  authenticateToken,
  requireRole(['admin']),
  auditLogger('DELETE', 'user'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent admin from deleting themselves
      if (user.id === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      // Check if user has any applications (prevent deletion if they do)
      if (user.role?.name === 'student') {
        const student = await Student.findOne({ where: { user_id: id } });
        if (student) {
          const { Application } = require('../models');
          const applicationCount = await Application.count({
            where: { student_id: student.id }
          });

          if (applicationCount > 0) {
            return res.status(400).json({
              success: false,
              message: 'Cannot delete user with existing applications. Deactivate instead.'
            });
          }
        }
      }

      await user.destroy();

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
);

// Get user statistics (admin only)
router.get('/stats/overview',
  authenticateToken,
  requireRole(['admin']),
  async (req, res) => {
    try {
      const stats = {
        total_users: await User.count(),
        active_users: await User.count({ where: { is_active: true } }),
        inactive_users: await User.count({ where: { is_active: false } }),
        by_role: await User.findAll({
          attributes: [
            [User.sequelize.col('role.name'), 'role_name'],
            [User.sequelize.fn('COUNT', User.sequelize.col('users.id')), 'count']
          ],
          include: [{
            model: Role,
            as: 'role',
            attributes: []
          }],
          group: ['role.name'],
          raw: true
        }),
        recent_registrations: await User.count({
          where: {
            created_at: {
              [Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
            }
          }
        })
      };

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user statistics'
      });
    }
  }
);

module.exports = router;