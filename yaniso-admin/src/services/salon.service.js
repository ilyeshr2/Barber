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
      console.log('updateSalonInfo called with data:', salonData);
      
      // Use FormData if file uploads are included
      let requestData = salonData;
      const hasFile = salonData instanceof FormData || 
                     (salonData.logo && salonData.logo instanceof File) || 
                     (salonData.image && salonData.image instanceof File);
      
      if (hasFile) {
        console.log('Has file uploads, using FormData');
        
        // If already FormData, use it as is but verify the logo file is properly attached
        if (salonData instanceof FormData) {
          requestData = salonData;
          
          // Check if the FormData has the required files
          let hasLogoFile = false;
          let hasImageFile = false;
          
          // Log FormData contents for debugging
          console.log('FormData entries:');
          for (let pair of requestData.entries()) {
            if (pair[0] === 'logo' && pair[1] instanceof File) {
              hasLogoFile = true;
              console.log('Logo file found:', pair[1].name, '(', pair[1].size, 'bytes )');
            } else if (pair[0] === 'image' && pair[1] instanceof File) {
              hasImageFile = true;
              console.log('Image file found:', pair[1].name, '(', pair[1].size, 'bytes )');
            } else {
              console.log(pair[0], ':', pair[1]);
            }
          }
          
          if (salonData.get('logo') && !hasLogoFile) {
            console.warn('WARNING: FormData has logo field but it is not a File instance');
          }
          
          if (salonData.get('image') && !hasImageFile) {
            console.warn('WARNING: FormData has image field but it is not a File instance');
          }
        } else {
          // Convert regular object to FormData
          const formData = new FormData();
          Object.keys(salonData).forEach(key => {
            if (key === 'logo' && salonData[key] instanceof File) {
              console.log(`Appending file ${key}:`, salonData[key].name, '(', salonData[key].size, 'bytes )');
              formData.append(key, salonData[key]);
            } else if (key === 'image' && salonData[key] instanceof File) {
              console.log(`Appending file ${key}:`, salonData[key].name, '(', salonData[key].size, 'bytes )');
              formData.append(key, salonData[key]);
            } else if (key === 'socialLinks' && typeof salonData[key] === 'object') {
              console.log(`Appending JSON ${key}`);
              formData.append(key, JSON.stringify(salonData[key]));
            } else {
              console.log(`Appending ${key}:`, salonData[key]);
              formData.append(key, salonData[key]);
            }
          });
          requestData = formData;
        }
      }
      
      console.log('Making API request to /admin/salon');
      const response = await api.put('/admin/salon', requestData, {
        headers: hasFile ? { 
          'Content-Type': 'multipart/form-data'
        } : {}
      });
      
      console.log('Received response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in salon.service updateSalonInfo:', error);
      console.error('Error details:', error.response?.data || error.message);
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