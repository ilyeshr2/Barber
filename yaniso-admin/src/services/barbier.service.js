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
      // No need to transform field names anymore
      const response = await api.post('/admin/barbers', barbierData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create barber');
    }
  }
  
  async updateBarbier(id, barbierData) {
    try {
      // No need to transform field names anymore
      const response = await api.put(`/admin/barbers/${id}`, barbierData);
      return response.data;
    } catch (error) {
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