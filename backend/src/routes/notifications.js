const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middlewares/auth');
const { validate, querySchemas } = require('../middlewares/validation');
const { Notification } = require('../models');
const { Op } = require('sequelize');

// Get user notifications
router.get('/',
  authenticateToken,
  validate(querySchemas.pagination, 'query'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        is_read,
        type,
        priority
      } = req.query;

      const offset = (page - 1) * limit;
      const whereClause = { user_id: req.user.id };

      if (is_read !== undefined) {
        whereClause.is_read = is_read === 'true';
      }

      if (type) {
        whereClause.type = type;
      }

      if (priority) {
        whereClause.priority = priority;
      }

      // Filter out expired notifications
      whereClause[Op.or] = [
        { expires_at: null },
        { expires_at: { [Op.gt]: new Date() } }
      ];

      const { count, rows: notifications } = await Notification.findAndCountAll({
        where: whereClause,
        order: [
          ['priority', 'DESC'],
          ['created_at', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: {
          notifications,
          pagination: {
            current_page: parseInt(page),
            total_pages: Math.ceil(count / limit),
            total_items: count,
            items_per_page: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch notifications'
      });
    }
  }
);

// Get unread notification count
router.get('/unread-count',
  authenticateToken,
  async (req, res) => {
    try {
      const count = await Notification.count({
        where: {
          user_id: req.user.id,
          is_read: false,
          [Op.or]: [
            { expires_at: null },
            { expires_at: { [Op.gt]: new Date() } }
          ]
        }
      });

      res.json({
        success: true,
        data: { unread_count: count }
      });
    } catch (error) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch unread count'
      });
    }
  }
);

// Mark notification as read
router.put('/:id/read',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.markAsRead();

      res.json({
        success: true,
        message: 'Notification marked as read',
        data: { notification }
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read'
      });
    }
  }
);

// Mark all notifications as read
router.put('/mark-all-read',
  authenticateToken,
  async (req, res) => {
    try {
      const [updatedCount] = await Notification.update(
        {
          is_read: true,
          read_at: new Date()
        },
        {
          where: {
            user_id: req.user.id,
            is_read: false
          }
        }
      );

      res.json({
        success: true,
        message: `${updatedCount} notifications marked as read`
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications as read'
      });
    }
  }
);

// Delete notification
router.delete('/:id',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;

      const notification = await Notification.findOne({
        where: {
          id,
          user_id: req.user.id
        }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }
);

// Create notification (admin only - for system announcements)
router.post('/',
  authenticateToken,
  async (req, res) => {
    try {
      // Only allow admins to create system notifications
      if (req.user.role.name !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can create notifications'
        });
      }

      const {
        user_ids,
        type = 'system_announcement',
        title,
        message,
        priority = 'medium',
        expires_at,
        action_url
      } = req.body;

      if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array is required'
        });
      }

      if (!title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Title and message are required'
        });
      }

      // Create notifications for all specified users
      const notifications = await Promise.all(
        user_ids.map(user_id =>
          Notification.create({
            user_id,
            type,
            title,
            message,
            priority,
            expires_at: expires_at ? new Date(expires_at) : null,
            action_url
          })
        )
      );

      res.status(201).json({
        success: true,
        message: `${notifications.length} notifications created successfully`,
        data: { notifications }
      });
    } catch (error) {
      console.error('Create notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create notifications'
      });
    }
  }
);

module.exports = router;