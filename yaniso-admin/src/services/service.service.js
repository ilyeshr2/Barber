// src/services/service.service.js - Updated for dynamic data
import api from './api';

class ServiceService {
  async getAllServices() {
    try {
      const response = await api.get('/admin/services');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  }
  
  async getServicesByBarberId(barberId) {
    try {
      const response = await api.get(`/barbers/${barberId}/services`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch barber services');
    }
  }
  
  // Alias for getServicesByBarberId to maintain compatibility with both naming conventions
  async getServicesByBarbierId(barbierId) {
    return this.getServicesByBarberId(barbierId);
  }
  
  async getServiceById(id) {
    try {
      const response = await api.get(`/admin/services/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service details');
    }
  }
  
  async createService(serviceData) {
    try {
      const response = await api.post('/admin/services', serviceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create service');
    }
  }
  
  async updateService(id, serviceData) {
    try {
      const response = await api.put(`/admin/services/${id}`, serviceData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update service');
    }
  }
  
  async deleteService(id) {
    try {
      const response = await api.delete(`/admin/services/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete service');
    }
  }
}

export default new ServiceService();