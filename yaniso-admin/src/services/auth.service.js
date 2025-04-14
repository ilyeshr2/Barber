// src/services/auth.service.js - Updated to use new API structure
import api from './api';

class AuthService {
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }
  
  async getProfile() {
    try {
      const response = await api.get('/admin/profile');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
  
  async updateProfile(userData) {
    try {
      const response = await api.put('/admin/profile', userData);
      
      // Update local storage with new user data
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...user,
        ...response.data
      }));
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update profile');
    }
  }
  
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }
  
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

export default new AuthService();