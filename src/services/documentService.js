import api from './authService';

export const documentService = {
  async uploadDocument(file, applicationId, documentType) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('application_id', applicationId);
      formData.append('document_type', documentType);

      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Document upload failed');
    }
  },

  async getDocuments(applicationId) {
    try {
      const response = await api.get(`/documents/application/${applicationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch documents');
    }
  },

  async downloadDocument(documentId) {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Document download failed');
    }
  },

  async verifyDocument(documentId, verificationStatus, notes = '') {
    try {
      const response = await api.put(`/documents/${documentId}/verify`, {
        verification_status: verificationStatus,
        verification_notes: notes
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Document verification failed');
    }
  },

  async deleteDocument(documentId) {
    try {
      const response = await api.delete(`/documents/${documentId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Document deletion failed');
    }
  },

  // Helper function to get file type icon
  getFileTypeIcon(mimeType) {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('image')) return '🖼️';
    return '📎';
  },

  // Helper function to format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate file before upload
  validateFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg', 'image/png', 'image/jpg'];

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please upload PDF, DOC, DOCX, JPG, or PNG files.');
    }

    return true;
  }
};