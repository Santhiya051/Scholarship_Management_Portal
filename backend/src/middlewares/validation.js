const Joi = require('joi');

// ==============================
// Generic validation middleware
// ==============================
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    req[property] = value;
    next();
  };
};

// ==============================
// User validation schemas
// ==============================
const userSchemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      }),
    first_name: Joi.string().min(2).max(50).required(),
    last_name: Joi.string().min(2).max(50).required(),
    phone: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/).optional(),
    student_id: Joi.string().required(),
    department: Joi.string()
      .valid('computer-science', 'engineering', 'business', 'medicine', 'arts', 'sciences')
      .required(),
    major: Joi.string().required(),
    year_of_study: Joi.number().integer().min(1).max(6).required(),
    gpa: Joi.number().min(0).max(4.0).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    first_name: Joi.string().min(2).max(50).optional(),
    last_name: Joi.string().min(2).max(50).optional(),
    phone: Joi.string().pattern(/^[+]?[1-9]\d{1,14}$/).optional(),
    gpa: Joi.number().min(0).max(4.0).optional()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string()
      .min(8)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .required()
  })
};

// ==============================
// Scholarship validation schemas
// ==============================
const scholarshipSchemas = {
  create: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().required(),
    amount: Joi.number().positive().required(),
    total_funding: Joi.number().positive().required(),
    max_recipients: Joi.number().integer().positive().required(),
    application_deadline: Joi.date().greater('now').required(),
    award_date: Joi.date().optional(),
    academic_year: Joi.string().required(),
    department: Joi.string()
      .valid('all', 'computer-science', 'engineering', 'business', 'medicine', 'arts', 'sciences')
      .default('all'),
    min_gpa: Joi.number().min(0).max(4.0).optional(),
    year_of_study: Joi.array()
      .items(Joi.number().integer().min(1).max(6))
      .default([1, 2, 3, 4]),
    requirements: Joi.array().items(Joi.string()).default([]),
    criteria: Joi.object().default({}),
    is_renewable: Joi.boolean().default(false),
    renewal_criteria: Joi.object().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(3).max(200).optional(),
    description: Joi.string().optional(),
    amount: Joi.number().positive().optional(),
    total_funding: Joi.number().positive().optional(),
    max_recipients: Joi.number().integer().positive().optional(),
    application_deadline: Joi.date().greater('now').optional(),
    award_date: Joi.date().optional(),
    academic_year: Joi.string().optional(),
    department: Joi.string()
      .valid('all', 'computer-science', 'engineering', 'business', 'medicine', 'arts', 'sciences')
      .optional(),
    min_gpa: Joi.number().min(0).max(4.0).optional(),
    year_of_study: Joi.array().items(Joi.number().integer().min(1).max(6)).optional(),
    requirements: Joi.array().items(Joi.string()).optional(),
    criteria: Joi.object().optional(),
    status: Joi.string().valid('draft', 'active', 'closed', 'cancelled').optional(),
    is_renewable: Joi.boolean().optional(),
    renewal_criteria: Joi.object().optional()
  })
};

// ==============================
// Application validation schemas
// ==============================
const applicationSchemas = {
  create: Joi.object({
    scholarship_id: Joi.string().uuid().required(),
    personal_info: Joi.object({
      first_name: Joi.string().required(),
      last_name: Joi.string().required(),
      email: Joi.string().email().required(),
      phone: Joi.string().required(),
      address: Joi.object().optional()
    }).required(),
    academic_info: Joi.object({
      student_id: Joi.string().required(),
      gpa: Joi.number().min(0).max(4.0).required(),
      major: Joi.string().required(),
      year_of_study: Joi.number().integer().min(1).max(6).required()
    }).required(),
    essays: Joi.object().default({}),
    financial_info: Joi.object().default({})
  }),

  update: Joi.object({
    personal_info: Joi.object().optional(),
    academic_info: Joi.object().optional(),
    essays: Joi.object().optional(),
    financial_info: Joi.object().optional()
  }),

  review: Joi.object({
    action: Joi.string().valid('approved', 'rejected', 'returned').required(),
    score: Joi.number().min(0).max(100).optional(),
    comments: Joi.string().optional(),
    criteria_scores: Joi.object().optional()
  })
};

// ==============================
// Query validation schemas
// ==============================
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort: Joi.string().optional(),
  order: Joi.string().valid('ASC', 'DESC').default('DESC')
});

const querySchemas = {
  pagination: paginationSchema,

  scholarshipFilters: Joi.object({
    department: Joi.string().optional(),
    status: Joi.string().valid('draft', 'active', 'closed', 'cancelled').optional(),
    min_amount: Joi.number().optional(),
    max_amount: Joi.number().optional(),
    search: Joi.string().optional()
  }).concat(paginationSchema),

  applicationFilters: Joi.object({
    status: Joi.string()
      .valid(
        'draft',
        'submitted',
        'under_review',
        'pending_documents',
        'approved',
        'rejected',
        'withdrawn'
      )
      .optional(),
    scholarship_id: Joi.string().uuid().optional(),
    student_id: Joi.string().uuid().optional(),
    approval_step: Joi.string().valid('coordinator', 'committee', 'finance').optional()
  }).concat(paginationSchema)
};

// ==============================
// File upload validation
// ==============================
const fileValidation = {
  validateFileUpload: (req, res, next) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png').split(',');
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 5242880;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB`
      });
    }

    next();
  }
};

// ==============================
// Exports
// ==============================
module.exports = {
  validate,
  userSchemas,
  scholarshipSchemas,
  applicationSchemas,
  querySchemas,
  fileValidation
};
