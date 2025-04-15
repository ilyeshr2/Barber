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
      // Map frontend field names to backend expected names
      const apiClientData = {
        first_name: clientData.prenom,
        last_name: clientData.nom,
        email: clientData.email,
        telephone: clientData.telephone,
        date_of_birth: clientData.dateNaissance,
        gender: clientData.genre,
        password: clientData.motDePasse
      };
      
      const response = await api.post('/admin/clients', apiClientData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to create client');
    }
  }
  
  async updateClient(id, clientData) {
    try {
      // Map frontend field names to backend expected names
      const apiClientData = {
        first_name: clientData.prenom,
        last_name: clientData.nom,
        email: clientData.email,
        telephone: clientData.telephone,
        date_of_birth: clientData.dateNaissance,
        gender: clientData.genre
      };
      
      // Only include password if provided
      if (clientData.motDePasse) {
        apiClientData.password = clientData.motDePasse;
      }
      
      const response = await api.put(`/admin/clients/${id}`, apiClientData);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
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