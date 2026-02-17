const express = require('express');
const router = express.Router();
const scholarshipController = require('../controllers/scholarshipController');
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validate, scholarshipSchemas, querySchemas } = require('../middlewares/validation');
const { auditLogger } = require('../middlewares/security');

// Get all scholarships (accessible to all authenticated users)
router.get('/', 
  authenticateToken,
  validate(querySchemas.scholarshipFilters, 'query'),
  scholarshipController.getScholarships
);

// Get single scholarship by ID
router.get('/:id', 
  authenticateToken,
  scholarshipController.getScholarshipById
);

// Get scholarship statistics (admin/coordinator only)
router.get('/stats/overview', 
  authenticateToken,
  requireRole(['admin', 'coordinator']),
  scholarshipController.getScholarshipStats
);

// Create new scholarship (admin/coordinator only)
router.post('/', 
  authenticateToken,
  requireRole(['admin', 'coordinator']),
  validate(scholarshipSchemas.create),
  auditLogger('CREATE', 'scholarship'),
  scholarshipController.createScholarship
);

// Update scholarship (admin/coordinator only)
router.put('/:id', 
  authenticateToken,
  requireRole(['admin', 'coordinator']),
  validate(scholarshipSchemas.update),
  auditLogger('UPDATE', 'scholarship'),
  scholarshipController.updateScholarship
);

// Delete scholarship (admin only)
router.delete('/:id', 
  authenticateToken,
  requireRole(['admin']),
  auditLogger('DELETE', 'scholarship'),
  scholarshipController.deleteScholarship
);

module.exports = router;