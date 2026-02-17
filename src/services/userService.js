import api from './authService';

export const userService = {
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  async getUserById(id) {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  async getProfile() {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  },

  async updateProfile(userData) {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  },

  async createUser(userData) {
    try {
      const response = await api.post('/users', userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  async updateUser(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  async updateUserStatus(id, isActive) {
    try {
      const response = await api.put(`/users/${id}/status`, {
        is_active: isActive
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user status');
    }
  },

  async deleteUser(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  async getUserStats() {
    try {
      const response = await api.get('/users/stats/overview');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user statistics');
    }
  },

  // Helper function to get role display name
  getRoleDisplayName(roleName) {
    const roleNames = {
      student: 'Student',
      coordinator: 'Department Coordinator',
      committee: 'Scholarship Committee',
      finance: 'Finance Officer',
      admin: 'Administrator'
    };
    return roleNames[roleName] || roleName;
  },

  // Helper function to get role color
  getRoleColor(roleName) {
    const colors = {
      student: 'blue',
      coordinator: 'green',
      committee: 'purple',
      finance: 'orange',
      admin: 'red'
    };
    return colors[roleName] || 'gray';
  },

  // Helper function to get user status
  getUserStatus(user) {
    if (!user.is_active) return 'Inactive';
    if (!user.email_verified) return 'Unverified';
    if (user.locked_until && new Date(user.locked_until) > new Date()) return 'Locked';
    return 'Active';
  },

  // Helper function to get status color
  getStatusColor(user) {
    const status = this.getUserStatus(user);
    const colors = {
      Active: 'green',
      Inactive: 'red',
      Unverified: 'yellow',
      Locked: 'orange'
    };
    return colors[status] || 'gray';
  },

  // Helper function to format last login
  formatLastLogin(lastLogin) {
    if (!lastLogin) return 'Never';
    
    const date = new Date(lastLogin);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  }
};