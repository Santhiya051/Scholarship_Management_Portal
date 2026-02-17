import api from './authService';

export const notificationService = {
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  async getUnreadCount() {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch unread count');
    }
  },

  async markAsRead(id) {
    try {
      const response = await api.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  async markAllAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  async deleteNotification(id) {
    try {
      const response = await api.delete(`/notifications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  },

  async createNotification(userIds, title, message, type = 'system_announcement', priority = 'medium', expiresAt = null, actionUrl = null) {
    try {
      const response = await api.post('/notifications', {
        user_ids: userIds,
        title,
        message,
        type,
        priority,
        expires_at: expiresAt,
        action_url: actionUrl
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create notification');
    }
  },

  // Helper function to get notification icon
  getNotificationIcon(type) {
    const icons = {
      application_submitted: '📝',
      application_approved: '✅',
      application_rejected: '❌',
      document_required: '📄',
      document_verified: '✔️',
      payment_processed: '💰',
      deadline_reminder: '⏰',
      system_announcement: '📢',
      account_update: '👤',
      other: '🔔'
    };
    return icons[type] || '🔔';
  },

  // Helper function to get priority color
  getPriorityColor(priority) {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      urgent: 'red'
    };
    return colors[priority] || 'blue';
  },

  // Helper function to format relative time
  getRelativeTime(date) {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  },

  // Helper function to truncate message
  truncateMessage(message, maxLength = 100) {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  }
};