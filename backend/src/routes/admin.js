const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

// Apply authentication to all admin routes
router.use(authenticateToken);

// Dashboard
router.get('/dashboard/stats', requireRole(['admin', 'coordinator', 'committee', 'finance']), adminController.getDashboardStats);

// Roles
router.get('/roles', requireRole(['admin']), adminController.getAllRoles);

// User Management (Admin only)
router.get('/users', requireRole(['admin']), adminController.getAllUsers);
router.get('/users/:id', requireRole(['admin']), adminController.getUserById);
router.post('/users', requireRole(['admin']), adminController.createUser);
router.put('/users/:id', requireRole(['admin']), adminController.updateUser);
router.delete('/users/:id', requireRole(['admin']), adminController.deleteUser);

// Scholarship Management
router.get('/scholarships', requireRole(['admin', 'coordinator']), adminController.getAllScholarshipsAdmin);
router.post('/scholarships', requireRole(['admin', 'coordinator']), adminController.createScholarshipAdmin);
router.put('/scholarships/:id', requireRole(['admin', 'coordinator']), adminController.updateScholarshipAdmin);
router.delete('/scholarships/:id', requireRole(['admin', 'coordinator']), adminController.deleteScholarshipAdmin);

// Application Management
router.get('/applications', requireRole(['admin', 'coordinator', 'committee']), adminController.getAllApplicationsAdmin);
router.post('/applications/:id/review', requireRole(['admin', 'coordinator', 'committee']), adminController.reviewApplication);
router.post('/applications/bulk-review', requireRole(['admin', 'coordinator', 'committee']), adminController.bulkReviewApplications);

// Analytics & Reports
router.get('/analytics', requireRole(['admin', 'coordinator', 'committee', 'finance']), adminController.getAnalyticsData);

// Payment Management
router.get('/payments', requireRole(['admin', 'finance']), adminController.getAllPayments);
router.post('/payments/:id/process', requireRole(['admin', 'finance']), adminController.processPayment);
router.post('/payments/bulk-process', requireRole(['admin', 'finance']), adminController.bulkProcessPayments);

// Notification Management
router.get('/notifications/templates', requireRole(['admin', 'coordinator']), adminController.getNotificationTemplates);
router.post('/notifications/bulk', requireRole(['admin', 'coordinator']), adminController.sendBulkNotification);

// System Settings
router.get('/settings', requireRole(['admin']), adminController.getSystemSettings);
router.put('/settings', requireRole(['admin']), adminController.updateSystemSettings);

module.exports = router;