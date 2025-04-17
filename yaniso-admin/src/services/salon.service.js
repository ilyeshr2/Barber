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
  
  // Direct method to update social links using a dedicated endpoint
  async updateSocialLinksDirectly(socialLinks) {
    try {
      console.log('Making direct request to update social links:', JSON.stringify(socialLinks, null, 2));
      
      // Send direct PUT request to a simpler endpoint
      const response = await api.put('/admin/salon/social-links', { socialLinks });
      
      console.log('Social links update response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Error updating social links directly:', error);
      throw new Error(error.response?.data?.message || 'Failed to update social links');
    }
  }
  
  async updateSalonInfo(salonData) {
    try {
      console.log('updateSalonInfo called with data:', JSON.stringify(salonData, null, 2));
      
      // If this is just a social links update, use the direct method instead
      if (salonData.socialLinks && Object.keys(salonData).length === 1) {
        console.log('Redirecting to direct social links update method');
        return this.updateSocialLinksDirectly(salonData.socialLinks);
      }
      
      // Use FormData if file uploads are included
      let requestData = salonData;
      const hasFile = salonData instanceof FormData || 
                     (salonData.logo && salonData.logo instanceof File) || 
                     (salonData.image && salonData.image instanceof File);
      
      if (hasFile) {
        // If already FormData, use it as is
        if (salonData instanceof FormData) {
          requestData = salonData;
          
          // Check if the FormData has the required files
          let hasLogoFile = false;
          let hasImageFile = false;
          
          for (let pair of requestData.entries()) {
            if (pair[0] === 'logo' && pair[1] instanceof File) {
              hasLogoFile = true;
            } else if (pair[0] === 'image' && pair[1] instanceof File) {
              hasImageFile = true;
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
              formData.append(key, salonData[key]);
            } else if (key === 'image' && salonData[key] instanceof File) {
              formData.append(key, salonData[key]);
            } else if (key === 'socialLinks' && typeof salonData[key] === 'object') {
              formData.append(key, JSON.stringify(salonData[key]));
            } else {
              formData.append(key, salonData[key]);
            }
          });
          requestData = formData;
        }
      } else if (salonData.socialLinks) {
        // If we're just updating socialLinks (not in FormData), make sure it's sent properly
        console.log('Sending socialLinks update with data:', JSON.stringify(salonData.socialLinks, null, 2));
        requestData = { ...salonData };
      }
      
      console.log('Making request with data:', 
                  hasFile ? 'FormData object' : JSON.stringify(requestData, null, 2));
                  
      const response = await api.put('/admin/salon', requestData, {
        headers: hasFile ? { 
          'Content-Type': 'multipart/form-data'
        } : {}
      });
      
      console.log('Response from server:', JSON.stringify(response.data, null, 2));
      
      // Log social links specifically to ensure they're present
      if (response.data.socialLinks) {
        console.log('Social links in response:', JSON.stringify(response.data.socialLinks, null, 2));
      } else {
        console.warn('WARNING: No social links in response!');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error in salon.service updateSalonInfo:', error);
      throw new Error(error.response?.data?.message || 'Failed to update salon information');
    }
  }
  
  async updateBusinessHours(hoursData) {
    try {
      // Wrap hours data in a business_hours property as expected by the API
      const requestData = {
        business_hours: hoursData
      };
      
      // Add request interceptor to log the actual request
      const requestInterceptor = api.interceptors.request.use(request => {
        return request;
      });
      
      // Add response interceptor to log the response
      const responseInterceptor = api.interceptors.response.use(
        response => {
          return response;
        },
        error => {
          return Promise.reject(error);
        }
      );
      
      const response = await api.put('/admin/salon/hours', requestData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Clean up interceptors
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
      
      return response.data;
    } catch (error) {
      console.error('Error in updateBusinessHours:', error);
      throw new Error(error.response?.data?.message || 'Failed to update business hours');
    }
  }
}

export default new SalonService();