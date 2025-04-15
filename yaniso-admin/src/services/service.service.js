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
      console.log('Service API Response:', JSON.stringify(response.data));
      
      // Transform snake_case field names to the expected French names
      const transformedServices = response.data.map(service => ({
        id: service.id,
        nom: service.name,
        description: service.description,
        duree: service.duration,
        prix: service.price,
        BarberId: service.barber_id,
        isActive: service.is_active,
        createdAt: service.created_at,
        updatedAt: service.updated_at
      }));
      
      return transformedServices;
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