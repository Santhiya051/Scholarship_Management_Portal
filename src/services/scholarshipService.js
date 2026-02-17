import api from './authService';

export const scholarshipService = {
  async getScholarships(params = {}) {
    try {
      const response = await api.get('/scholarships', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scholarships');
    }
  },

  async getScholarship(id) {
    try {
      const response = await api.get(`/scholarships/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch scholarship');
    }
  },

  async getScholarshipById(id) {
    return this.getScholarship(id);
  },

  async createScholarship(scholarshipData) {
    try {
      const response = await api.post('/scholarships', scholarshipData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create scholarship');
    }
  },

  async updateScholarship(id, scholarshipData) {
    try {
      const response = await api.put(`/scholarships/${id}`, scholarshipData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update scholarship');
    }
  },

  async deleteScholarship(id) {
    try {
      const response = await api.delete(`/scholarships/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete scholarship');
    }
  },

  async getEligibleScholarships(studentId) {
    try {
      const response = await api.get(`/scholarships/eligible/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch eligible scholarships');
    }
  }
};