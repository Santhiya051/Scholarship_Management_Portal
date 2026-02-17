import api from './api';

export const adminService = {
  // Dashboard Analytics
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  // Roles
  getAllRoles: async () => {
    const response = await api.get('/admin/roles');
    return response.data;
  },

  // User Management
  getAllUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  getUserById: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/admin/users', userData);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/admin/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // Scholarship Management
  getAllScholarshipsAdmin: async (params = {}) => {
    // Use the existing scholarships endpoint for now
    const response = await api.get('/scholarships', { params });
    return response.data;
  },

  createScholarship: async (scholarshipData) => {
    const response = await api.post('/scholarships', scholarshipData);
    return response.data;
  },

  updateScholarship: async (scholarshipId, scholarshipData) => {
    const response = await api.put(`/scholarships/${scholarshipId}`, scholarshipData);
    return response.data;
  },

  deleteScholarship: async (scholarshipId) => {
    const response = await api.delete(`/scholarships/${scholarshipId}`);
    return response.data;
  },

  // Application Management
  getAllApplicationsAdmin: async (params = {}) => {
    const response = await api.get('/admin/applications', { params });
    return response.data;
  },

  reviewApplication: async (applicationId, reviewData) => {
    const response = await api.post(`/admin/applications/${applicationId}/review`, reviewData);
    return response.data;
  },

  bulkReviewApplications: async (applicationIds, reviewData) => {
    const response = await api.post('/admin/applications/bulk-review', {
      application_ids: applicationIds,
      ...reviewData
    });
    return response.data;
  },

  getApplicationDetails: async (applicationId) => {
    const response = await api.get(`/admin/applications/${applicationId}`);
    return response.data;
  },

  // Reports and Analytics
  getAnalyticsData: async (params = {}) => {
    const response = await api.get('/admin/analytics', { params });
    return response.data;
  },

  exportReport: async (reportType, params = {}) => {
    const response = await api.get(`/admin/reports/${reportType}/export`, {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  getApplicationTrends: async (params = {}) => {
    const response = await api.get('/admin/analytics/trends', { params });
    return response.data;
  },

  getDepartmentStats: async (params = {}) => {
    const response = await api.get('/admin/analytics/departments', { params });
    return response.data;
  },

  getScholarshipPerformance: async (params = {}) => {
    const response = await api.get('/admin/analytics/scholarships', { params });
    return response.data;
  },

  // System Management
  getSystemSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSystemSettings: async (settings) => {
    const response = await api.put('/admin/settings', settings);
    return response.data;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },

  // Notifications
  sendBulkNotification: async (notificationData) => {
    const response = await api.post('/admin/notifications/bulk', notificationData);
    return response.data;
  },

  getNotificationTemplates: async () => {
    const response = await api.get('/admin/notifications/templates');
    return response.data;
  },

  // Payment Management
  getAllPayments: async (params = {}) => {
    const response = await api.get('/admin/payments', { params });
    return response.data;
  },

  processPayment: async (paymentId, paymentData) => {
    const response = await api.post(`/admin/payments/${paymentId}/process`, paymentData);
    return response.data;
  },

  bulkProcessPayments: async (paymentIds, paymentData) => {
    const response = await api.post('/admin/payments/bulk-process', {
      payment_ids: paymentIds,
      ...paymentData
    });
    return response.data;
  },

  // Document Management
  getDocumentVerificationQueue: async (params = {}) => {
    const response = await api.get('/admin/documents/verification-queue', { params });
    return response.data;
  },

  verifyDocument: async (documentId, verificationData) => {
    const response = await api.post(`/admin/documents/${documentId}/verify`, verificationData);
    return response.data;
  },

  bulkVerifyDocuments: async (documentIds, verificationData) => {
    const response = await api.post('/admin/documents/bulk-verify', {
      document_ids: documentIds,
      ...verificationData
    });
    return response.data;
  }
};

export default adminService;