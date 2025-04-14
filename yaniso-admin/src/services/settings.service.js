// src/services/settings.service.js - New service for app settings
import api from './api';

class SettingsService {
  async getAllSettings() {
    try {
      const response = await api.get('/admin/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
  
  async getPublicSettings() {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch public settings');
    }
  }
  
  async updateSetting(key, value) {
    try {
      const response = await api.put(`/admin/settings/${key}`, { value });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update setting');
    }
  }
}

export default new SettingsService();