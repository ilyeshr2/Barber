
// src/services/publication.service.js - Updated for dynamic data
import api from './api';

class PublicationService {
  async getAllPublications() {
    try {
      const response = await api.get('/publications');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch publications');
    }
  }
  
  async getPublicationById(id) {
    try {
      const response = await api.get(`/admin/publications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch publication details');
    }
  }
  
  async createPublication(publicationData) {
    try {
      // Use FormData for file uploads
      let requestData = publicationData;
      const hasFile = publicationData.image instanceof File || publicationData.authorImage instanceof File;
      
      if (hasFile || publicationData instanceof FormData) {
        if (!(publicationData instanceof FormData)) {
          const formData = new FormData();
          Object.keys(publicationData).forEach(key => {
            if ((key === 'image' || key === 'authorImage') && publicationData[key] instanceof File) {
              formData.append(key, publicationData[key]);
            } else {
              formData.append(key, publicationData[key]);
            }
          });
          requestData = formData;
        } else {
          requestData = publicationData;
        }
      }
      
      const response = await api.post('/admin/publications', requestData, {
        headers: hasFile || publicationData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create publication');
    }
  }
  
  async updatePublication(id, publicationData) {
    try {
      // Use FormData for file uploads
      let requestData = publicationData;
      const hasFile = publicationData.image instanceof File || publicationData.authorImage instanceof File;
      
      if (hasFile || publicationData instanceof FormData) {
        if (!(publicationData instanceof FormData)) {
          const formData = new FormData();
          Object.keys(publicationData).forEach(key => {
            if ((key === 'image' || key === 'authorImage') && publicationData[key] instanceof File) {
              formData.append(key, publicationData[key]);
            } else {
              formData.append(key, publicationData[key]);
            }
          });
          requestData = formData;
        } else {
          requestData = publicationData;
        }
      }
      
      const response = await api.put(`/admin/publications/${id}`, requestData, {
        headers: hasFile || publicationData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update publication');
    }
  }
  
  async deletePublication(id) {
    try {
      const response = await api.delete(`/admin/publications/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete publication');
    }
  }
  
  async likePublication(id) {
    try {
      const response = await api.post(`/publications/${id}/like`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to like publication');
    }
  }
}

export default new PublicationService();