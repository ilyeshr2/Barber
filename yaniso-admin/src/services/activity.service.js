import api from './api'

class ActivityService {
  async getRecentActivities(limit = 5) {
    try {
      // This endpoint should be implemented on the backend
      // For now, we'll simulate activity data based on other endpoints
      
      // Combine activities from different sources
      const [appointments, clients, services] = await Promise.all([
        this.getAppointmentActivities(),
        this.getClientActivities(),
        this.getServiceActivities()
      ]);
      
      // Combine all activities and sort by date (newest first)
      const allActivities = [...appointments, ...clients, ...services]
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, limit); // Limit to specified number
        
      return allActivities;
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      throw error;
    }
  }
  
  async getAppointmentActivities() {
    try {
      const response = await api.get('/appointments?limit=10&sort=createdAt:desc');
      
      // Map appointment data to activity format
      return response.data.map(appointment => ({
        id: `appointment-${appointment.id}`,
        type: 'appointment',
        icon: this.getAppointmentIcon(appointment.status),
        title: this.getAppointmentTitle(appointment),
        timestamp: appointment.createdAt || appointment.updatedAt || new Date().toISOString(),
        timeDisplay: this.getTimeDisplay(appointment.createdAt || appointment.updatedAt),
        data: appointment
      }));
    } catch (error) {
      console.error('Error fetching appointment activities:', error);
      return []; // Return empty array to prevent breaking the main function
    }
  }
  
  async getClientActivities() {
    try {
      const response = await api.get('/users?limit=5&sort=createdAt:desc');
      
      // Map client data to activity format
      return response.data.map(client => ({
        id: `client-${client.id}`,
        type: 'client',
        icon: 'bi bi-person-plus',
        title: `New client: ${client.first_name} ${client.last_name || ''}`,
        timestamp: client.createdAt || new Date().toISOString(),
        timeDisplay: this.getTimeDisplay(client.createdAt),
        data: client
      }));
    } catch (error) {
      console.error('Error fetching client activities:', error);
      return []; // Return empty array to prevent breaking the main function
    }
  }
  
  async getServiceActivities() {
    try {
      const response = await api.get('/services?limit=5&sort=updatedAt:desc');
      
      // Map service data to activity format
      return response.data.map(service => ({
        id: `service-${service.id}`,
        type: 'service',
        icon: 'bi bi-scissors',
        title: `Service "${service.name || service.nom}" updated`,
        timestamp: service.updatedAt || new Date().toISOString(),
        timeDisplay: this.getTimeDisplay(service.updatedAt),
        data: service
      }));
    } catch (error) {
      console.error('Error fetching service activities:', error);
      return []; // Return empty array to prevent breaking the main function
    }
  }
  
  getAppointmentIcon(status) {
    switch(status) {
      case 'confirmed':
      case 'confirmé':
        return 'bi bi-calendar-plus';
      case 'completed':
      case 'terminé':
        return 'bi bi-calendar-check';
      case 'cancelled':
      case 'annulé':
        return 'bi bi-calendar-x';
      default:
        return 'bi bi-calendar';
    }
  }
  
  getAppointmentTitle(appointment) {
    let clientName = 'a client';
    
    // Try to extract client name from appointment
    if (appointment.User) {
      clientName = `${appointment.User.first_name} ${appointment.User.last_name || ''}`;
    } else if (appointment.Utilisateur) {
      clientName = `${appointment.Utilisateur.prenom} ${appointment.Utilisateur.nom || ''}`;
    }
    
    // Return appropriate message based on status
    switch(appointment.status) {
      case 'confirmed':
      case 'confirmé':
        return `New appointment with ${clientName}`;
      case 'completed':
      case 'terminé':
        return `Appointment with ${clientName} completed`;
      case 'cancelled':
      case 'annulé':
        return `Appointment with ${clientName} cancelled`;
      default:
        return `Appointment with ${clientName} updated`;
    }
  }
  
  getTimeDisplay(timestamp) {
    if (!timestamp) return 'Recently';
    
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    // For older activities, show the date
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return activityTime.toLocaleDateString(undefined, options);
  }
}

export default new ActivityService(); 