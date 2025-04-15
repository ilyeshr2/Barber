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
      // Get all appointments directly instead of using the specific endpoint
      const response = await api.get('/admin/appointments');
      
      // Filter for future appointments regardless of status
      const now = new Date();
      const upcomingAppointments = response.data.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date);
        return appointmentDate > now;
      });
      
      // Map the filtered appointments
      const mappedAppointments = upcomingAppointments.map(appointment => ({
        ...appointment,
        UtilisateurId: appointment.user_id,
        BarbierId: appointment.barber_id,
        ServiceId: appointment.service_id,
        date: appointment.appointment_date,
        statut: appointment.status === 'confirmed' ? 'confirmé' : 
                appointment.status === 'cancelled' ? 'annulé' : 
                appointment.status === 'completed' ? 'terminé' : 'confirmé',
        // Map nested objects if they exist
        User: appointment.User,
        Barbier: appointment.Barber,
        Service: appointment.Service
      }));
      
      return mappedAppointments;
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
      // Map frontend field names to backend expected names
      const apiAppointmentData = {
        user_id: appointmentData.UtilisateurId,
        barber_id: appointmentData.BarbierId,
        service_id: appointmentData.ServiceId,
        appointment_date: appointmentData.date,
        status: appointmentData.statut === 'confirmé' ? 'confirmed' : 
                appointmentData.statut === 'annulé' ? 'cancelled' : 
                appointmentData.statut === 'terminé' ? 'completed' : 'confirmed'
      };
      
      const response = await api.post('/admin/appointments', apiAppointmentData);
      
      // Map the response back to frontend field names if needed
      const mappedResponse = {
        ...response.data,
        UtilisateurId: response.data.user_id,
        BarbierId: response.data.barber_id,
        ServiceId: response.data.service_id,
        date: response.data.appointment_date,
        statut: response.data.status === 'confirmed' ? 'confirmé' : 
                response.data.status === 'cancelled' ? 'annulé' : 
                response.data.status === 'completed' ? 'terminé' : 'confirmé'
      };
      
      return mappedResponse;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  }
  
  async updateAppointmentStatus(id, status) {
    try {
      // Map frontend status to backend status
      const backendStatus = status === 'confirmé' ? 'confirmed' :
                          status === 'annulé' ? 'cancelled' :
                          status === 'terminé' ? 'completed' : 'confirmed';
      
      const response = await api.put(`/admin/appointments/${id}/status`, { status: backendStatus });
      
      // Map the response back to frontend field names if needed
      const mappedResponse = {
        ...response.data,
        UtilisateurId: response.data.user_id,
        BarbierId: response.data.barber_id,
        ServiceId: response.data.service_id,
        date: response.data.appointment_date,
        statut: response.data.status === 'confirmed' ? 'confirmé' : 
                response.data.status === 'cancelled' ? 'annulé' : 
                response.data.status === 'completed' ? 'terminé' : 'confirmé'
      };
      
      return mappedResponse;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  }
  
  async deleteAppointment(id) {
    try {
      const response = await api.delete(`/admin/appointments/${id}`);
      return response.data;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
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
      // Get today's date in the format expected by the backend (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
      
      // Get all appointments directly instead of using the specific endpoint
      const response = await api.get('/admin/appointments');
      
      // Filter appointments for today
      const todayAppointments = response.data.filter(appointment => {
        const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
        return appointmentDate === today;
      });
      
      // Map the response data to ensure consistent format with other methods
      const mappedAppointments = todayAppointments.map(appointment => ({
        ...appointment,
        UtilisateurId: appointment.user_id,
        BarbierId: appointment.barber_id,
        ServiceId: appointment.service_id,
        date: appointment.appointment_date,
        statut: appointment.status === 'confirmed' ? 'confirmé' : 
                appointment.status === 'cancelled' ? 'annulé' : 
                appointment.status === 'completed' ? 'terminé' : 'confirmé'
      }));
      
      return mappedAppointments;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch today\'s appointments');
    }
  }

  async updateAppointment(id, appointmentData) {
    try {
      // Since there's no direct endpoint to update the whole appointment,
      // we need to use the available status update endpoint
      // For now, just update the status and potentially add more business logic as needed
      const backendStatus = appointmentData.statut === 'confirmé' ? 'confirmed' :
                         appointmentData.statut === 'annulé' ? 'cancelled' :
                         appointmentData.statut === 'terminé' ? 'completed' : 'confirmed';
      
      const response = await api.put(`/admin/appointments/${id}/status`, { status: backendStatus });
      
      console.log('Response from update status:', response.data);
      
      // Map the response back to frontend field names
      const mappedResponse = {
        ...response.data,
        UtilisateurId: response.data.user_id,
        BarbierId: response.data.barber_id,
        ServiceId: response.data.service_id,
        date: response.data.appointment_date,
        statut: response.data.status === 'confirmed' ? 'confirmé' : 
                response.data.status === 'cancelled' ? 'annulé' : 
                response.data.status === 'completed' ? 'terminé' : 'confirmé'
      };
      
      return mappedResponse;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to update appointment');
    }
  }

  async cancelAppointment(id) {
    try {
      const response = await this.updateAppointmentStatus(id, 'annulé');
      return response;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
  
  async completeAppointment(id) {
    try {
      const response = await this.updateAppointmentStatus(id, 'terminé');
      return response;
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to complete appointment');
    }
  }
}

export default new AppointmentService();