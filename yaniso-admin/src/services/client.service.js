
// src/services/client.service.js - Updated for dynamic data
import api from './api';

class ClientService {
  async getAllClients() {
    try {
      const response = await api.get('/admin/clients');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch clients');
    }
  }
  
  async getClientById(id) {
    try {
      const response = await api.get(`/admin/clients/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch client details');
    }
  }
  
  async getClientAppointments(id) {
    try {
      const response = await api.get(`/admin/clients/${id}/appointments`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch client appointments');
    }
  }
  
  async createClient(clientData) {
    try {
      const response = await api.post('/admin/clients', clientData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create client');
    }
  }
  
  async updateClient(id, clientData) {
    try {
      const response = await api.put(`/admin/clients/${id}`, clientData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update client');
    }
  }
  
  async deleteClient(id) {
    try {
      const response = await api.delete(`/admin/clients/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete client');
    }
  }
}

export default new ClientService();