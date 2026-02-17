import api from './authService';

export const paymentService = {
  async getPayments(params = {}) {
    try {
      const response = await api.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payments');
    }
  },

  async getPaymentById(id) {
    try {
      const response = await api.get(`/payments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment');
    }
  },

  async processPayment(id, transactionId, notes = '') {
    try {
      const response = await api.post(`/payments/${id}/process`, {
        transaction_id: transactionId,
        notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Payment processing failed');
    }
  },

  async updatePaymentStatus(id, status, failureReason = '', notes = '') {
    try {
      const response = await api.put(`/payments/${id}/status`, {
        status,
        failure_reason: failureReason,
        notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update payment status');
    }
  },

  async createPaymentBatch(paymentIds, notes = '') {
    try {
      const response = await api.post('/payments/batch', {
        payment_ids: paymentIds,
        notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create payment batch');
    }
  },

  async getPaymentStats() {
    try {
      const response = await api.get('/payments/stats/overview');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch payment statistics');
    }
  },

  // Helper function to get status color
  getStatusColor(status) {
    const colors = {
      pending: 'yellow',
      approved: 'blue',
      processing: 'purple',
      completed: 'green',
      failed: 'red',
      cancelled: 'gray'
    };
    return colors[status] || 'gray';
  },

  // Helper function to format currency
  formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },

  // Helper function to get payment method display name
  getPaymentMethodName(method) {
    const methods = {
      bank_transfer: 'Bank Transfer',
      check: 'Check',
      direct_deposit: 'Direct Deposit',
      digital_wallet: 'Digital Wallet',
      other: 'Other'
    };
    return methods[method] || method;
  }
};