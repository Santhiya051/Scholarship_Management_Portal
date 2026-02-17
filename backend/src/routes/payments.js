const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middlewares/auth');
const { validate, querySchemas } = require('../middlewares/validation');
const { auditLogger } = require('../middlewares/security');
const { Payment, Application, Student, User, Scholarship } = require('../models');
const { Op } = require('sequelize');

// Get payments (finance officers and admin)
router.get('/',
  authenticateToken,
  requireRole(['finance', 'admin']),
  validate(querySchemas.pagination, 'query'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        sort = 'created_at',
        order = 'DESC',
        status,
        scheduled_date_from,
        scheduled_date_to
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = {};

      if (status) {
        whereClause.status = status;
      }

      if (scheduled_date_from || scheduled_date_to) {
        whereClause.scheduled_date = {};
        if (scheduled_date_from) {
          whereClause.scheduled_date[Op.gte] = scheduled_date_from;
        }
        if (scheduled_date_to) {
          whereClause.scheduled_date[Op.lte] = scheduled_date_to;
        }
      }

      const { count, rows: payments } = await Payment.findAndCountAll({
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
                  attributes: ['first_name', 'last_name', 'email']
                }]
              },
              {
                model: Scholarship,
                as: 'scholarship',
                attributes: ['name', 'academic_year']
              }
            ]
          },
          {
            model: User,
            as: 'processor',
            attributes: ['first_name', 'last_name']
          }
        ],
        order: [[sort, order.toUpperCase()]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get payments error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payments'
      });
    }
  }
);

// Get single payment
router.get('/:id',
  authenticateToken,
  requireRole(['finance', 'admin']),
  async (req, res) => {
    try {
      const { id } = req.params;

      const payment = await Payment.findByPk(id, {
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
                  attributes: ['first_name', 'last_name', 'email']
                }]
              },
              {
                model: Scholarship,
                as: 'scholarship'
              }
            ]
          },
          {
            model: User,
            as: 'processor',
            attributes: ['first_name', 'last_name']
          }
        ]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      res.json({
        success: true,
        data: { payment }
      });
    } catch (error) {
      console.error('Get payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment'
      });
    }
  }
);

// Process payment
router.post('/:id/process',
  authenticateToken,
  requireRole(['finance', 'admin']),
  auditLogger('PROCESS', 'payment'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { transaction_id, notes } = req.body;

      const payment = await Payment.findByPk(id, {
        include: [{
          model: Application,
          as: 'application',
          include: [{
            model: Student,
            as: 'student',
            include: [{
              model: User,
              as: 'user'
            }]
          }]
        }]
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      if (!payment.canBeProcessed()) {
        return res.status(400).json({
          success: false,
          message: 'Payment cannot be processed in current status'
        });
      }

      // Update payment status
      await payment.update({
        status: 'processing',
        processed_by: req.user.id,
        processed_at: new Date(),
        transaction_id,
        notes
      });

      // In a real system, this would integrate with payment gateway
      // For demo, we'll mark as completed immediately
      setTimeout(async () => {
        await payment.update({
          status: 'completed',
          completed_at: new Date()
        });
      }, 1000);

      res.json({
        success: true,
        message: 'Payment processing initiated',
        data: { payment }
      });
    } catch (error) {
      console.error('Process payment error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process payment'
      });
    }
  }
);

// Update payment status
router.put('/:id/status',
  authenticateToken,
  requireRole(['finance', 'admin']),
  auditLogger('UPDATE_STATUS', 'payment'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, failure_reason, notes } = req.body;

      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      const updateData = { status };
      
      if (status === 'failed' && failure_reason) {
        updateData.failure_reason = failure_reason;
        updateData.retry_count = (payment.retry_count || 0) + 1;
      }
      
      if (status === 'completed') {
        updateData.completed_at = new Date();
      }
      
      if (notes) {
        updateData.notes = notes;
      }

      await payment.update(updateData);

      res.json({
        success: true,
        message: 'Payment status updated',
        data: { payment }
      });
    } catch (error) {
      console.error('Update payment status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update payment status'
      });
    }
  }
);

// Create payment batch
router.post('/batch',
  authenticateToken,
  requireRole(['finance', 'admin']),
  auditLogger('CREATE_BATCH', 'payment'),
  async (req, res) => {
    try {
      const { payment_ids, notes } = req.body;

      if (!payment_ids || !Array.isArray(payment_ids) || payment_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment IDs array is required'
        });
      }

      // Verify all payments exist and are pending
      const payments = await Payment.findAll({
        where: {
          id: { [Op.in]: payment_ids },
          status: 'pending'
        }
      });

      if (payments.length !== payment_ids.length) {
        return res.status(400).json({
          success: false,
          message: 'Some payments are not found or not in pending status'
        });
      }

      // Calculate batch totals
      const totalAmount = payments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      const batchNumber = `BATCH-${new Date().toISOString().slice(0, 10)}-${Date.now()}`;

      // Create batch record (you'll need to create this table)
      // For now, we'll just update the payments with a batch reference
      const batchId = `batch-${Date.now()}`;
      
      await Payment.update(
        { 
          batch_id: batchId,
          status: 'approved'
        },
        { 
          where: { id: { [Op.in]: payment_ids } }
        }
      );

      res.json({
        success: true,
        message: 'Payment batch created successfully',
        data: {
          batch_id: batchId,
          batch_number: batchNumber,
          payment_count: payments.length,
          total_amount: totalAmount
        }
      });
    } catch (error) {
      console.error('Create payment batch error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create payment batch'
      });
    }
  }
);

// Get payment statistics
router.get('/stats/overview',
  authenticateToken,
  requireRole(['finance', 'admin']),
  async (req, res) => {
    try {
      const stats = {
        total_payments: await Payment.count(),
        pending_payments: await Payment.count({ where: { status: 'pending' } }),
        processing_payments: await Payment.count({ where: { status: 'processing' } }),
        completed_payments: await Payment.count({ where: { status: 'completed' } }),
        failed_payments: await Payment.count({ where: { status: 'failed' } }),
        total_amount_disbursed: await Payment.sum('amount', { 
          where: { status: 'completed' } 
        }) || 0,
        pending_amount: await Payment.sum('amount', { 
          where: { status: { [Op.in]: ['pending', 'approved', 'processing'] } } 
        }) || 0
      };

      // Monthly disbursement stats
      const monthlyStats = await Payment.findAll({
        attributes: [
          [Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('completed_at')), 'month'],
          [Payment.sequelize.fn('COUNT', Payment.sequelize.col('id')), 'count'],
          [Payment.sequelize.fn('SUM', Payment.sequelize.col('amount')), 'total_amount']
        ],
        where: {
          status: 'completed',
          completed_at: {
            [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 12))
          }
        },
        group: [Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('completed_at'))],
        order: [[Payment.sequelize.fn('DATE_TRUNC', 'month', Payment.sequelize.col('completed_at')), 'ASC']]
      });

      stats.monthly_disbursements = monthlyStats;

      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get payment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch payment statistics'
      });
    }
  }
);

module.exports = router;