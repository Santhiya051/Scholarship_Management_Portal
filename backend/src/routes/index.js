const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const scholarshipRoutes = require('./scholarships');
const applicationRoutes = require('./applications');
const documentRoutes = require('./documents');
const paymentRoutes = require('./payments');
const notificationRoutes = require('./notifications');
const userRoutes = require('./users');
const adminRoutes = require('./admin');

// API version prefix
const API_VERSION = process.env.API_VERSION || 'v1';

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Scholarship Management API is running',
    version: API_VERSION,
    timestamp: new Date().toISOString()
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/scholarships', scholarshipRoutes);
router.use('/applications', applicationRoutes);
router.use('/documents', documentRoutes);
router.use('/payments', paymentRoutes);
router.use('/notifications', notificationRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

module.exports = router;