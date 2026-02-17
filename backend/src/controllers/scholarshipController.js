const { Scholarship, User, Student, Application, EligibilityRule, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Get all scholarships with filtering and pagination
const getScholarships = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'DESC',
      department,
      status,
      min_amount,
      max_amount,
      search
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    
    if (department && department !== 'all') {
      whereClause.department = department;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    if (min_amount || max_amount) {
      whereClause.amount = {};
      if (min_amount) whereClause.amount[Op.gte] = min_amount;
      if (max_amount) whereClause.amount[Op.lte] = max_amount;
    }
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // For students, only show active scholarships they're eligible for
    if (req.user.role.name === 'student') {
      whereClause.status = 'active';
      whereClause.application_deadline = { [Op.gt]: new Date() };
      
      // Get student info for eligibility check
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (student) {
        // Filter by department if scholarship is department-specific
        if (student.department) {
          whereClause[Op.or] = [
            { department: 'all' },
            { department: student.department }
          ];
        }
      }
    }

    const { count, rows: scholarships } = await Scholarship.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: EligibilityRule,
          as: 'eligibilityRules'
        }
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // For students, check eligibility for each scholarship
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      
      for (let scholarship of scholarships) {
        scholarship.dataValues.is_eligible = student ? student.isEligibleForScholarship(scholarship) : false;
        
        // Check if student has already applied
        const existingApplication = await Application.findOne({
          where: {
            student_id: student?.id,
            scholarship_id: scholarship.id
          }
        });
        scholarship.dataValues.has_applied = !!existingApplication;
        scholarship.dataValues.application_status = existingApplication?.status || null;
      }
    }

    res.json({
      success: true,
      data: {
        scholarships,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scholarships'
    });
  }
};

// Get single scholarship by ID
const getScholarshipById = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: EligibilityRule,
          as: 'eligibilityRules'
        },
        {
          model: Application,
          as: 'applications',
          include: [
            {
              model: Student,
              as: 'student',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['first_name', 'last_name', 'email']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'student') {
      // Students can only see active scholarships
      if (scholarship.status !== 'active') {
        return res.status(404).json({
          success: false,
          message: 'Scholarship not found'
        });
      }

      // Check eligibility and application status
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (student) {
        scholarship.dataValues.is_eligible = student.isEligibleForScholarship(scholarship);
        
        const existingApplication = await Application.findOne({
          where: {
            student_id: student.id,
            scholarship_id: scholarship.id
          }
        });
        scholarship.dataValues.has_applied = !!existingApplication;
        scholarship.dataValues.application_status = existingApplication?.status || null;
      }

      // Remove sensitive data for students
      delete scholarship.dataValues.applications;
    }

    res.json({
      success: true,
      data: { scholarship }
    });
  } catch (error) {
    console.error('Get scholarship error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scholarship'
    });
  }
};

// Create new scholarship (admin/coordinator only)
const createScholarship = async (req, res) => {
  try {
    const scholarshipData = {
      ...req.body,
      created_by: req.user.id
    };

    const scholarship = await Scholarship.create(scholarshipData);

    // Create eligibility rules if provided
    if (req.body.eligibility_rules && req.body.eligibility_rules.length > 0) {
      const rules = req.body.eligibility_rules.map(rule => ({
        ...rule,
        scholarship_id: scholarship.id
      }));
      
      await EligibilityRule.bulkCreate(rules);
    }

    // Log creation
    await AuditLog.logCreate(req.user.id, 'scholarship', scholarship.id, scholarshipData);

    // Get scholarship with relations
    const createdScholarship = await Scholarship.findByPk(scholarship.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: EligibilityRule,
          as: 'eligibilityRules'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Scholarship created successfully',
      data: { scholarship: createdScholarship }
    });
  } catch (error) {
    console.error('Create scholarship error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scholarship'
    });
  }
};

// Update scholarship
const updateScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'coordinator' && scholarship.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only update scholarships you created'
      });
    }

    const oldValues = scholarship.toJSON();
    
    await scholarship.update(req.body);

    // Log update
    await AuditLog.logUpdate(req.user.id, 'scholarship', scholarship.id, oldValues, req.body);

    // Get updated scholarship
    const updatedScholarship = await Scholarship.findByPk(scholarship.id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: EligibilityRule,
          as: 'eligibilityRules'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Scholarship updated successfully',
      data: { scholarship: updatedScholarship }
    });
  } catch (error) {
    console.error('Update scholarship error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scholarship'
    });
  }
};

// Delete scholarship
const deleteScholarship = async (req, res) => {
  try {
    const { id } = req.params;

    const scholarship = await Scholarship.findByPk(id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    // Check if there are any applications
    const applicationCount = await Application.count({
      where: { scholarship_id: id }
    });

    if (applicationCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete scholarship with existing applications'
      });
    }

    // Check permissions
    if (req.user.role.name === 'coordinator' && scholarship.created_by !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete scholarships you created'
      });
    }

    const scholarshipData = scholarship.toJSON();
    
    await scholarship.destroy();

    // Log deletion
    await AuditLog.logDelete(req.user.id, 'scholarship', id, scholarshipData);

    res.json({
      success: true,
      message: 'Scholarship deleted successfully'
    });
  } catch (error) {
    console.error('Delete scholarship error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scholarship'
    });
  }
};

// Get scholarship statistics
const getScholarshipStats = async (req, res) => {
  try {
    const stats = {
      total_scholarships: await Scholarship.count(),
      active_scholarships: await Scholarship.count({ where: { status: 'active' } }),
      total_funding: await Scholarship.sum('total_funding') || 0,
      total_applications: await Application.count(),
      approved_applications: await Application.count({ where: { status: 'approved' } })
    };

    // Department-wise statistics
    const departmentStats = await Scholarship.findAll({
      attributes: [
        'department',
        [Scholarship.sequelize.fn('COUNT', Scholarship.sequelize.col('id')), 'count'],
        [Scholarship.sequelize.fn('SUM', Scholarship.sequelize.col('total_funding')), 'total_funding']
      ],
      group: ['department']
    });

    stats.by_department = departmentStats;

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get scholarship stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scholarship statistics'
    });
  }
};

module.exports = {
  getScholarships,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  getScholarshipStats
};