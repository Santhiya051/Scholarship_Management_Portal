const { Application, Student, Scholarship, User, Document, Approval, Payment, Notification, AuditLog } = require('../models');
const { Op } = require('sequelize');

// Get applications with filtering and pagination
const getApplications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = 'created_at',
      order = 'DESC',
      status,
      scholarship_id,
      student_id,
      approval_step
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where clause
    const whereClause = {};
    
    if (status) {
      whereClause.status = status;
    }
    
    if (scholarship_id) {
      whereClause.scholarship_id = scholarship_id;
    }
    
    if (student_id) {
      whereClause.student_id = student_id;
    }
    
    if (approval_step) {
      whereClause.current_approval_step = approval_step;
    }

    // Role-based filtering
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (student) {
        whereClause.student_id = student.id;
      }
    } else if (req.user.role.name === 'coordinator') {
      // Coordinators see applications for their department
      const coordinatorApplications = await Application.findAll({
        include: [
          {
            model: Student,
            as: 'student',
            where: { department: req.user.department || 'all' }
          }
        ],
        attributes: ['id']
      });
      
      const applicationIds = coordinatorApplications.map(app => app.id);
      if (applicationIds.length > 0) {
        whereClause.id = { [Op.in]: applicationIds };
      } else {
        whereClause.id = { [Op.in]: [] }; // No applications
      }
    } else if (req.user.role.name === 'committee') {
      // Committee sees applications in their review step
      whereClause.current_approval_step = 'committee';
      whereClause.status = 'under_review';
    } else if (req.user.role.name === 'finance') {
      // Finance sees approved applications
      whereClause[Op.or] = [
        { current_approval_step: 'finance', status: 'under_review' },
        { status: 'approved' }
      ];
    }

    const { count, rows: applications } = await Application.findAndCountAll({
      where: whereClause,
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
        },
        {
          model: Scholarship,
          as: 'scholarship',
          attributes: ['id', 'name', 'amount', 'department']
        },
        {
          model: Document,
          as: 'documents'
        },
        {
          model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              attributes: ['first_name', 'last_name']
            }
          ]
        }
      ],
      order: [[sort, order.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_items: count,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

// Get single application by ID
const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['first_name', 'last_name', 'email', 'phone']
            }
          ]
        },
        {
          model: Scholarship,
          as: 'scholarship'
        },
        {
          model: Document,
          as: 'documents'
        },
        {
          model: Approval,
          as: 'approvals',
          include: [
            {
              model: User,
              as: 'reviewer',
              attributes: ['first_name', 'last_name']
            }
          ]
        },
        {
          model: Payment,
          as: 'payment'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || application.student_id !== student.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: { application }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application'
    });
  }
};

// Create new application
const createApplication = async (req, res) => {
  try {
    const { scholarship_id, personal_info, academic_info, essays, financial_info } = req.body;

    // Get student
    const student = await Student.findOne({ where: { user_id: req.user.id } });
    if (!student) {
      return res.status(400).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Check if scholarship exists and is active
    const scholarship = await Scholarship.findByPk(scholarship_id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Scholarship not found'
      });
    }

    if (!scholarship.canAcceptMoreApplications()) {
      return res.status(400).json({
        success: false,
        message: 'Scholarship is no longer accepting applications'
      });
    }

    // Check if student already applied
    const existingApplication = await Application.findOne({
      where: {
        student_id: student.id,
        scholarship_id: scholarship_id
      }
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this scholarship'
      });
    }

    // Check eligibility
    if (!student.isEligibleForScholarship(scholarship)) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible for this scholarship'
      });
    }

    const application = await Application.create({
      student_id: student.id,
      scholarship_id,
      personal_info,
      academic_info,
      essays: essays || {},
      financial_info: financial_info || {},
      status: 'draft'
    });

    // Log creation
    await AuditLog.logCreate(req.user.id, 'application', application.id, {
      scholarship_id,
      student_id: student.id
    });

    // Get application with relations
    const createdApplication = await Application.findByPk(application.id, {
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
        },
        {
          model: Scholarship,
          as: 'scholarship'
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Application created successfully',
      data: { application: createdApplication }
    });
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application'
    });
  }
};

// Update application
const updateApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || application.student_id !== student.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Check if application can be edited
    if (!application.canBeEdited()) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be edited in current status'
      });
    }

    const oldValues = application.toJSON();
    
    await application.update(req.body);

    // Log update
    await AuditLog.logUpdate(req.user.id, 'application', application.id, oldValues, req.body);

    // Get updated application
    const updatedApplication = await Application.findByPk(application.id, {
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
        },
        {
          model: Scholarship,
          as: 'scholarship'
        },
        {
          model: Document,
          as: 'documents'
        }
      ]
    });

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: { application: updatedApplication }
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application'
    });
  }
};

// Submit application
const submitApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        },
        {
          model: Scholarship,
          as: 'scholarship'
        },
        {
          model: Document,
          as: 'documents'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || application.student_id !== student.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Check if application can be submitted
    if (!application.canBeSubmitted()) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be submitted in current status'
      });
    }

    // Check if all required documents are uploaded
    const requiredDocs = Document.getRequiredDocuments(application.scholarship_id);
    const uploadedDocTypes = application.documents.map(doc => doc.document_type);
    const missingDocs = requiredDocs.filter(type => !uploadedDocTypes.includes(type));

    if (missingDocs.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required documents',
        data: { missing_documents: missingDocs }
      });
    }

    await application.submit();

    // Create notification
    await Notification.createApplicationNotification(
      application.id,
      application.student.user.id,
      'application_submitted'
    );

    // Log submission
    await AuditLog.logAction(req.user.id, 'SUBMIT', 'application', application.id);

    res.json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

// Review application (approve/reject)
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, score, comments, criteria_scores } = req.body;

    const application = await Application.findByPk(id, {
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        },
        {
          model: Scholarship,
          as: 'scholarship'
        }
      ]
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user can review this application
    const userRole = req.user.role.name;
    if (!['coordinator', 'committee', 'finance', 'admin'].includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to review applications'
      });
    }

    // Check if application is in correct step for this reviewer
    if (application.current_approval_step !== userRole && userRole !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Application is not in ${userRole} review step`
      });
    }

    // Create approval record
    const approval = await Approval.create({
      application_id: application.id,
      approval_step: application.current_approval_step,
      reviewed_by: req.user.id,
      action,
      score,
      comments,
      criteria_scores: criteria_scores || {}
    });

    // Update application based on action
    if (action === 'approved') {
      await application.approve(req.user.id, comments);
      
      // If fully approved, create payment record
      if (application.status === 'approved') {
        await Payment.create({
          application_id: application.id,
          amount: application.scholarship.amount,
          status: 'pending'
        });
      }
    } else if (action === 'rejected') {
      await application.reject(req.user.id, comments);
    }

    // Create notification
    const notificationType = action === 'approved' ? 'application_approved' : 'application_rejected';
    await Notification.createApplicationNotification(
      application.id,
      application.student.user.id,
      notificationType,
      comments
    );

    // Log review
    await AuditLog.logAction(req.user.id, 'REVIEW', 'application', application.id, null, {
      action,
      score,
      comments
    });

    res.json({
      success: true,
      message: `Application ${action} successfully`,
      data: { application, approval }
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review application'
    });
  }
};

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || application.student_id !== student.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Check if application can be withdrawn
    if (!application.canBeWithdrawn()) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be withdrawn in current status'
      });
    }

    await application.update({ status: 'withdrawn' });

    // Log withdrawal
    await AuditLog.logAction(req.user.id, 'WITHDRAW', 'application', application.id);

    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
};

// Get application statistics
const getApplicationStats = async (req, res) => {
  try {
    const stats = {
      total_applications: await Application.count(),
      by_status: await Application.findAll({
        attributes: [
          'status',
          [Application.sequelize.fn('COUNT', Application.sequelize.col('id')), 'count']
        ],
        group: ['status']
      }),
      by_approval_step: await Application.findAll({
        attributes: [
          'current_approval_step',
          [Application.sequelize.fn('COUNT', Application.sequelize.col('id')), 'count']
        ],
        where: {
          current_approval_step: { [Op.ne]: null }
        },
        group: ['current_approval_step']
      })
    };

    // Role-specific stats
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (student) {
        stats.my_applications = await Application.count({
          where: { student_id: student.id }
        });
      }
    }

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics'
    });
  }
};

// Delete application (draft only)
const deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    if (req.user.role.name === 'student') {
      const student = await Student.findOne({ where: { user_id: req.user.id } });
      if (!student || application.student_id !== student.id) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    // Check if application can be deleted (only drafts)
    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft applications can be deleted'
      });
    }

    const applicationData = application.toJSON();
    
    await application.destroy();

    // Log deletion
    await AuditLog.logDelete(req.user.id, 'application', id, applicationData);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application'
    });
  }
};

module.exports = {
  getApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  deleteApplication,
  submitApplication,
  reviewApplication,
  withdrawApplication,
  getApplicationStats
};