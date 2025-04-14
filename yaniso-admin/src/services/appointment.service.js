// src/services/appointment.service.js - Updated for dynamic data
import api from './api';

class AppointmentService {
  async getAllAppointments() {
    try {
      const response = await api.get('/admin/appointments');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
  
  async getUpcomingAppointments() {
    try {
      const response = await api.get('/admin/appointments/upcoming');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming appointments');
    }
  }
  
  async getAppointmentsByDate(date) {
    try {
      const response = await api.get(`/admin/appointments/by-date?date=${date}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments for date');
    }
  }
  
  async createAppointment(appointmentData) {
    try {
      const response = await api.post('/admin/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  }
  
  async updateAppointmentStatus(id, status) {
    try {
      const response = await api.put(`/admin/appointments/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  }
  
  async deleteAppointment(id) {
    try {
      const response = await api.delete(`/admin/appointments/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete appointment');
    }
  }
  
  async checkAvailability(barberId, date) {
    try {
      const response = await api.get(`/appointments/check-availability?barbierId=${barberId}&date=${date}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to check availability');
    }
  }

  async getTodayAppointments() {
    try {
      const response = await api.get('/admin/appointments/today');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch today\'s appointments');
    }
  }
}

export default new AppointmentService();