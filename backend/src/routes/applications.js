const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validate, applicationSchemas, querySchemas } = require('../middlewares/validation');
const { auditLogger } = require('../middlewares/security');

// Get all applications (with role-based filtering)
router.get('/', 
  authenticateToken,
  validate(querySchemas.applicationFilters, 'query'),
  applicationController.getApplications
);

// Get my applications (students only)
router.get('/my', 
  authenticateToken,
  requireRole(['student']),
  validate(querySchemas.applicationFilters, 'query'),
  applicationController.getApplications
);

// Get single application by ID
router.get('/:id', 
  authenticateToken,
  applicationController.getApplicationById
);

// Get application statistics
router.get('/stats/overview', 
  authenticateToken,
  applicationController.getApplicationStats
);

// Create new application (students only)
router.post('/', 
  authenticateToken,
  requireRole(['student']),
  validate(applicationSchemas.create),
  auditLogger('CREATE', 'application'),
  applicationController.createApplication
);

// Update application (students can update their own, others can update any)
router.put('/:id', 
  authenticateToken,
  validate(applicationSchemas.update),
  auditLogger('UPDATE', 'application'),
  applicationController.updateApplication
);

// Submit application (students only)
router.post('/:id/submit', 
  authenticateToken,
  requireRole(['student']),
  auditLogger('SUBMIT', 'application'),
  applicationController.submitApplication
);

// Review application (coordinators, committee, finance, admin)
router.post('/:id/review', 
  authenticateToken,
  requireRole(['coordinator', 'committee', 'finance', 'admin']),
  validate(applicationSchemas.review),
  auditLogger('REVIEW', 'application'),
  applicationController.reviewApplication
);

// Withdraw application (students only)
router.post('/:id/withdraw', 
  authenticateToken,
  requireRole(['student']),
  auditLogger('WITHDRAW', 'application'),
  applicationController.withdrawApplication
);

// Delete application (students can delete draft applications)
router.delete('/:id', 
  authenticateToken,
  requireRole(['student']),
  auditLogger('DELETE', 'application'),
  applicationController.deleteApplication
);

module.exports = router;