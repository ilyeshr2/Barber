// src/services/service.service.js - Updated for dynamic data
import api from './api';

class ServiceService {
  async getAllServices() {
    try {
      const response = await api.get('/admin/services');
      
      // Transform the response data to ensure it includes BarberIds for each service
      const transformedServices = response.data.map(service => {
        // Create the BarberIds array from the barbiers array if it exists
        const BarberIds = service.barbiers && Array.isArray(service.barbiers) 
          ? service.barbiers.map(barbier => barbier.id) 
          : (service.BarberId ? [service.BarberId] : []);
          
        return {
          ...service,
          BarberIds // Add/override with the correct barber IDs array
        };
      });
      
      console.log('Transformed services with BarberIds:', transformedServices);
      return transformedServices;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  }
  
  async getServicesByBarberId(barberId) {
    try {
      console.log(`Fetching services for barber ${barberId} using the direct API`);
      // Try the direct API first on port 3001
      try {
        const response = await fetch(`http://localhost:3001/api/barbers/${barberId}/services`);
        if (response.ok) {
          const data = await response.json();
          console.log('Direct API Response:', JSON.stringify(data));
          
          // Transform snake_case field names to the expected French names
          const transformedServices = data.map(service => ({
            id: service.id,
            nom: service.name,
            description: service.description,
            duree: service.duration,
            prix: service.price,
            BarberId: barberId, // Add this for compatibility
            BarberIds: [barberId], // Make sure BarberIds is set too
            isActive: service.is_active,
            createdAt: service.created_at,
            updatedAt: service.updated_at
          }));
          
          return transformedServices;
        }
        console.log('Direct API failed, falling back to regular API');
      } catch (directApiError) {
        console.log('Error using direct API, falling back to regular API:', directApiError);
      }
      
      // Fall back to regular API
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
        BarberIds: [barberId], // Make sure this barber is included in BarberIds
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
      
      // Make sure the response includes BarberIds
      const service = response.data;
      const BarberIds = service.barbiers && Array.isArray(service.barbiers)
        ? service.barbiers.map(barbier => barbier.id)
        : (service.BarberId ? [service.BarberId] : []);
        
      return {
        ...service,
        BarberIds
      };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service details');
    }
  }
  
  async createService(serviceData) {
    try {
      // Create a copy of the service data
      const serviceDataCopy = { ...serviceData };

      // Extract barber IDs if present 
      const barberIds = serviceDataCopy.BarberIds;
      delete serviceDataCopy.BarberIds; // Remove from the main data to avoid confusion

      // If we have multiple barber IDs, send them in a separate field
      if (barberIds && barberIds.length > 0) {
        serviceDataCopy.barberIds = barberIds;
      }

      const response = await api.post('/admin/services', serviceDataCopy);
      
      // Add BarberIds back to the response for frontend use - use barbiers array if available
      const responseData = {
        ...response.data,
        BarberIds: response.data.barbiers 
          ? response.data.barbiers.map(b => b.id) 
          : (response.data.barberIds || (response.data.BarberId ? [response.data.BarberId] : []))
      };
      
      return responseData;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create service');
    }
  }
  
  async updateService(id, serviceData) {
    try {
      // Create a copy of the service data
      const serviceDataCopy = { ...serviceData };

      // Extract barber IDs if present
      const barberIds = serviceDataCopy.BarberIds;
      delete serviceDataCopy.BarberIds; // Remove from the main data to avoid confusion

      // If we have multiple barber IDs, send them in a separate field
      if (barberIds && barberIds.length > 0) {
        serviceDataCopy.barberIds = barberIds;
      }

      const response = await api.put(`/admin/services/${id}`, serviceDataCopy);
      
      // Add BarberIds back to the response for frontend use - use barbiers array if available
      const responseData = {
        ...response.data,
        BarberIds: response.data.barbiers 
          ? response.data.barbiers.map(b => b.id) 
          : (response.data.barberIds || (response.data.BarberId ? [response.data.BarberId] : []))
      };
      
      return responseData;
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