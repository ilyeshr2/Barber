// src/services/barbier.service.js - Updated for dynamic data
import api from './api';

class BarbierService {
  async getAllBarbers() {
    try {
      const response = await api.get('/admin/barbers');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch barbers');
    }
  }
  
  async getBarbierById(id) {
    try {
      const response = await api.get(`/admin/barbers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch barber details');
    }
  }
  
  async createBarbier(barbierData) {
    try {
      // Check if the data is already FormData or needs to be converted
      let requestData = barbierData;
      const hasFile = barbierData.photo instanceof File;
      
      if (hasFile || barbierData instanceof FormData) {
        // FormData is already properly formatted with backend field names
        if (!(barbierData instanceof FormData)) {
          const formData = new FormData();
          Object.keys(barbierData).forEach(key => {
            if (key === 'photo' && barbierData[key] instanceof File) {
              formData.append('photo', barbierData[key]);
            } else {
              formData.append(key, barbierData[key]);
            }
          });
          requestData = formData;
        }
        
        const response = await api.post('/admin/barbers', requestData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
        // For JSON requests, ensure we're using the backend field names
        // No need for mapping here as it's already mapped in BarbierForm.vue
        const response = await api.post('/admin/barbers', barbierData);
        return response.data;
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to create barber');
    }
  }
  
  async updateBarbier(id, barbierData) {
    try {
      // Check if the data is already FormData or needs to be converted
      let requestData = barbierData;
      const hasFile = barbierData.photo instanceof File;
      
      if (hasFile || barbierData instanceof FormData) {
        // FormData is already properly formatted with backend field names
        if (!(barbierData instanceof FormData)) {
          const formData = new FormData();
          Object.keys(barbierData).forEach(key => {
            if (key === 'photo' && barbierData[key] instanceof File) {
              formData.append('photo', barbierData[key]);
            } else {
              formData.append(key, barbierData[key]);
            }
          });
          requestData = formData;
        }
        
        const response = await api.put(`/admin/barbers/${id}`, requestData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
      } else {
        // For JSON requests, ensure we're using the backend field names
        // No need for mapping here as it's already mapped in BarbierForm.vue
        const response = await api.put(`/admin/barbers/${id}`, barbierData);
        return response.data;
      }
    } catch (error) {
      console.error('API Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update barber');
    }
  }
  
  async deleteBarbier(id) {
    try {
      await api.delete(`/admin/barbers/${id}`);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete barber');
    }
  }
}

export default new BarbierService();