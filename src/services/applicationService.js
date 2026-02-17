import api from './authService';

export const applicationService = {
  async getApplications(params = {}) {
    try {
      const response = await api.get('/applications', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch applications');
    }
  },

  async getMyApplications(params = {}) {
    try {
      const response = await api.get('/applications/my', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch my applications');
    }
  },

  async getApplicationById(id) {
    try {
      const response = await api.get(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch application');
    }
  },

  async createApplication(applicationData) {
    try {
      const response = await api.post('/applications', applicationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create application');
    }
  },

  async updateApplication(id, applicationData) {
    try {
      const response = await api.put(`/applications/${id}`, applicationData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update application');
    }
  },

  async deleteApplication(id) {
    try {
      const response = await api.delete(`/applications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete application');
    }
  },

  async submitApplication(id) {
    try {
      const response = await api.post(`/applications/${id}/submit`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to submit application');
    }
  },

  async reviewApplication(id, reviewData) {
    try {
      const response = await api.post(`/applications/${id}/review`, reviewData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to review application');
    }
  },

  async uploadDocument(applicationId, file, documentType) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', documentType);
      
      const response = await api.post(`/applications/${applicationId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload document');
    }
  },

  async getStudentApplications(studentId) {
    try {
      const response = await api.get(`/applications/student/${studentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch student applications');
    }
  }
};