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
      console.log('%c ===== BUSINESS HOURS UPDATE DEBUG =====', 'background: #222; color: #bada55; font-size: 14px;');
      console.log('1. Raw data received by service:', JSON.stringify(hoursData, null, 2));
      
      // Wrap hours data in a business_hours property as expected by the API
      const requestData = {
        business_hours: hoursData
      };
      
      console.log('2. Formatted request data:', JSON.stringify(requestData, null, 2));
      console.log('3. API endpoint:', '/admin/salon/hours');
      console.log('4. Request headers:', {
        'Content-Type': 'application/json'
      });
      
      // Add request interceptor to log the actual request
      const requestInterceptor = api.interceptors.request.use(request => {
        console.log('5. Actual API request configuration:', {
          method: request.method,
          url: request.url,
          data: request.data,
          headers: request.headers
        });
        return request;
      });
      
      // Add response interceptor to log the response
      const responseInterceptor = api.interceptors.response.use(
        response => {
          console.log('6. API response status:', response.status);
          console.log('7. API response headers:', response.headers);
          console.log('8. API response data:', response.data);
          return response;
        },
        error => {
          console.error('6. API ERROR status:', error.response?.status);
          console.error('7. API ERROR data:', error.response?.data);
          console.error('8. API ERROR headers:', error.response?.headers);
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
      
      console.log('9. Business hours update success. Processing returned data...');
      console.log('10. Final response data:', response.data);
      console.log('%c ===== END DEBUG =====', 'background: #222; color: #bada55; font-size: 14px;');
      
      return response.data;
    } catch (error) {
      console.error('%c ===== BUSINESS HOURS UPDATE ERROR =====', 'background: #f00; color: #fff; font-size: 14px;');
      console.error('Error in updateBusinessHours:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      console.error('Stack trace:', error.stack);
      console.error('%c ===== END ERROR =====', 'background: #f00; color: #fff; font-size: 14px;');
      
      throw new Error(error.response?.data?.message || 'Failed to update business hours');
    }
  }
}

export default new SalonService();