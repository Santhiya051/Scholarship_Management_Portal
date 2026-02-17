import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Filter,
  Eye,
  Send,
  Plus,
  Users,
  Calendar,
  Trash2,
  Edit,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

const NotificationsManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [formData, setFormData] = useState({
    type: 'system_announcement',
    title: '',
    message: '',
    priority: 'medium',
    target_roles: ['student'],
    expires_at: '',
    action_url: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await adminService.getNotificationTemplates();
      setNotifications(Array.isArray(response.data) ? response.data : response.notifications || []);
    } catch (error) {
      toast.error('Failed to fetch notifications');
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    try {
      await adminService.sendBulkNotification(formData);
      toast.success('Notification sent successfully');
      setShowCreateModal(false);
      setFormData({
        type: 'system_announcement',
        title: '',
        message: '',
        priority: 'medium',
        target_roles: ['student'],
        expires_at: '',
        action_url: ''
      });
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to send notification');
      console.error('Error sending notification:', error);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'application_submitted': return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case 'application_approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'application_rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'deadline_reminder': return <Calendar className="w-4 h-4 text-orange-600" />;
      case 'system_announcement': return <Bell className="w-4 h-4 text-purple-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-900">Notifications Management</h1>
          <p className="text-academic-600 mt-1">Manage system notifications and announcements</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create Notification</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Total Notifications</p>
              <p className="text-2xl font-bold text-academic-900">{notifications.length}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Sent Today</p>
              <p className="text-2xl font-bold text-academic-900">
                {notifications.filter(n => {
                  const today = new Date().toDateString();
                  return new Date(n.created_at).toDateString() === today;
                }).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Recipients</p>
              <p className="text-2xl font-bold text-academic-900">
                {notifications.reduce((sum, n) => sum + (n.sent_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-academic-600">Urgent</p>
              <p className="text-2xl font-bold text-academic-900">
                {notifications.filter(n => n.priority === 'urgent').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-academic-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input"
            >
              <option value="all">All Types</option>
              <option value="application_submitted">Application Submitted</option>
              <option value="application_approved">Application Approved</option>
              <option value="application_rejected">Application Rejected</option>
              <option value="deadline_reminder">Deadline Reminder</option>
              <option value="system_announcement">System Announcement</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="card">
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <div key={notification.id} className="border border-academic-200 rounded-lg p-4 hover:bg-academic-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="p-2 bg-academic-100 rounded-lg">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-medium text-academic-900">{notification.title}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                    </div>
                    <p className="text-academic-600 mb-3 line-clamp-2">{notification.message}</p>
                    <div className="flex items-center space-x-4 text-sm text-academic-500">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>{notification.sent_count || 0} recipients</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                      </div>
                      {notification.email_sent && (
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4" />
                          <span>Email sent</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setSelectedNotification(notification);
                      setShowDetailsModal(true);
                    }}
                    className="text-academic-400 hover:text-academic-600"
                    title="View Details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    className="text-primary-600 hover:text-primary-900"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredNotifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="mx-auto h-12 w-12 text-academic-400" />
            <h3 className="mt-2 text-sm font-medium text-academic-900">No notifications found</h3>
            <p className="mt-1 text-sm text-academic-500">
              {searchTerm || typeFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first notification.'}
            </p>
          </div>
        )}
      </div>

      {/* Create Notification Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setFormData({
            type: 'system_announcement',
            title: '',
            message: '',
            priority: 'medium',
            target_roles: ['student'],
            expires_at: '',
            action_url: ''
          });
        }}
        title="Create Notification"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="input"
              >
                <option value="system_announcement">System Announcement</option>
                <option value="deadline_reminder">Deadline Reminder</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="input"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="Enter notification title..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Message
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="input"
              rows="4"
              placeholder="Enter notification message..."
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Target Roles
            </label>
            <div className="flex flex-wrap gap-3">
              {['student', 'coordinator', 'committee', 'finance', 'admin'].map((role) => (
                <label key={role} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.target_roles.includes(role)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, target_roles: [...formData.target_roles, role] });
                      } else {
                        setFormData({ ...formData, target_roles: formData.target_roles.filter(r => r !== role) });
                      }
                    }}
                    className="rounded border-academic-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-academic-700 capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Action URL (Optional)
            </label>
            <input
              type="url"
              value={formData.action_url}
              onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
              className="input"
              placeholder="https://..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-academic-700 mb-2">
              Expires At (Optional)
            </label>
            <input
              type="datetime-local"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="input"
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setFormData({
                  type: 'system_announcement',
                  title: '',
                  message: '',
                  priority: 'medium',
                  target_roles: ['student'],
                  expires_at: '',
                  action_url: ''
                });
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateNotification}
              className="btn btn-primary"
              disabled={!formData.title || !formData.message}
            >
              Send Notification
            </button>
          </div>
        </div>
      </Modal>

      {/* Notification Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedNotification(null);
        }}
        title="Notification Details"
        size="lg"
      >
        {selectedNotification && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700">Type</label>
                <p className="text-sm text-academic-900 capitalize">{selectedNotification.type?.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700">Priority</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedNotification.priority)}`}>
                  {selectedNotification.priority}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700">Title</label>
              <p className="text-sm text-academic-900">{selectedNotification.title}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-academic-700">Message</label>
              <p className="text-sm text-academic-900 whitespace-pre-wrap">{selectedNotification.message}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-academic-700">Recipients</label>
                <p className="text-sm text-academic-900">{selectedNotification.sent_count || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-academic-700">Created</label>
                <p className="text-sm text-academic-900">{new Date(selectedNotification.created_at).toLocaleString()}</p>
              </div>
            </div>
            {selectedNotification.action_url && (
              <div>
                <label className="block text-sm font-medium text-academic-700">Action URL</label>
                <a href={selectedNotification.action_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-800">
                  {selectedNotification.action_url}
                </a>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationsManagement;