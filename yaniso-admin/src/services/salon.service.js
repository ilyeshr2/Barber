
// src/services/salon.service.js - Updated for dynamic data
import api from './api';

class SalonService {
  async getSalonInfo() {
    try {
      const response = await api.get('/salon');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch salon information');
    }
  }
  
  async updateSalonInfo(salonData) {
    try {
      // Use FormData if file uploads are included
      let requestData = salonData;
      const hasFile = salonData.logo instanceof File || salonData.image instanceof File;
      
      if (hasFile) {
        const formData = new FormData();
        Object.keys(salonData).forEach(key => {
          if ((key === 'logo' || key === 'image') && salonData[key] instanceof File) {
            formData.append(key, salonData[key]);
          } else if (key === 'socialLinks' && typeof salonData[key] === 'object') {
            formData.append(key, JSON.stringify(salonData[key]));
          } else {
            formData.append(key, salonData[key]);
          }
        });
        requestData = formData;
      }
      
      const response = await api.put('/admin/salon', requestData, {
        headers: hasFile ? { 'Content-Type': 'multipart/form-data' } : {}
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update salon information');
    }
  }
  
  async updateBusinessHours(hoursData) {
    try {
      const response = await api.put('/admin/salon/hours', hoursData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update business hours');
    }
  }
}

export default new SalonService();