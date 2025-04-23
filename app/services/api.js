import * as http from "@nativescript/core/http";
import * as ApplicationSettings from "@nativescript/core/application-settings";
import config from "../utils/config";

const API_URL = config.API_URL;

// Function to get token from storage
const getToken = () => {
  return ApplicationSettings.getString('token', '');
};

// Function to save token
const saveToken = (token) => {
  if (token) {
    ApplicationSettings.setString('token', token);
  } else {
    ApplicationSettings.remove('token');
  }
};

// Function to save user info
const saveUserInfo = (user) => {
  if (user) {
    ApplicationSettings.setString('user', JSON.stringify(user));
  } else {
    ApplicationSettings.remove('user');
  }
};

// Function to get user info
const getUserInfo = () => {
  const userJson = ApplicationSettings.getString('user', '');
  return userJson ? JSON.parse(userJson) : null;
};

// HTTP requests with improved error handling
const fetchApi = async (endpoint, options = {}) => {
  try {
    const token = getToken();
    
    let headers = {
      "Content-Type": "application/json"
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const requestOptions = {
      url: `${API_URL}/${endpoint}`,
      method: options.method || "GET",
      headers: headers,
      timeout: 10000 // 10 seconds timeout
    };
    
    if (options.body) {
      requestOptions.content = JSON.stringify(options.body);
    }
    
    console.log(`Sending request to ${requestOptions.url}`, requestOptions);
    
    const response = await http.request(requestOptions);
    
    // Convert response to JSON
    const content = response.content.toString();
    
    // Check if response is HTML (often error page)
    if (content.trim().startsWith('<')) {
      throw new Error(`Server error: API returned HTML instead of JSON. Status: ${response.statusCode}`);
    }
    
    const data = content ? JSON.parse(content) : {};
    
    console.log(`Response from ${endpoint}:`, data);
    
    // Check if response is successful
    if (response.statusCode < 200 || response.statusCode >= 300) {
      // Handle specific status codes
      if (response.statusCode === 401) {
        // Unauthorized - clear auth data
        saveToken(null);
        saveUserInfo(null);
        throw new Error('Your session has expired. Please log in again.');
      } else if (response.statusCode === 403) {
        throw new Error('You do not have permission to perform this action.');
      } else if (response.statusCode === 404) {
        throw new Error('The requested resource was not found.');
      } else if (response.statusCode === 422) {
        throw new Error(data.message || 'Validation error. Please check your inputs.');
      } else if (response.statusCode >= 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      throw new Error(data.message || "Une erreur est survenue");
    }
    
    return data;
  } catch (error) {
    // Handle connection errors
    if (error.toString().includes('Failed to fetch') || 
        error.toString().includes('Network request failed') ||
        error.toString().includes('timeout')) {
      console.error(`Network error (${endpoint}):`, error);
      throw new Error('Network connection error. Please check your internet connection and try again.');
    }
    
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth service
export const authService = {
  signup: async (userData) => {
    try {
      // Format the data according to the new API structure
      const formattedData = {
        firstName: userData.prenom,
        lastName: userData.nom,
        dateOfBirth: userData.dateNaissance,
        gender: userData.genre,
        telephone: userData.telephone,
        email: userData.email,
        password: userData.motDePasse
      };
      
      const data = await fetchApi("auth/signup", {
        method: "POST",
        body: formattedData
      });
      
      if (data.token) {
        saveToken(data.token);
        saveUserInfo({
          id: data.id,
          nom: data.lastName,
          prenom: data.firstName,
          telephone: userData.telephone // Save the telephone from signup data
        });
      }
      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Error during registration');
    }
  },
  
  login: async (credentials) => {
    try {
      // Format credentials according to the new API structure
      const formattedCredentials = {
        telephone: credentials.telephone,
        password: credentials.motDePasse
      };
      
      const data = await fetchApi("auth/login", {
        method: "POST",
        body: formattedCredentials
      });
      
      if (data.token) {
        saveToken(data.token);
        saveUserInfo({
          id: data.id,
          nom: data.lastName,
          prenom: data.firstName,
          telephone: credentials.telephone // Save the telephone from login credentials
        });
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Error during login');
    }
  },
  
  getProfile: async () => {
    try {
      const data = await fetchApi("auth/profile");
      
      // Update the stored user data with the full profile
      if (data) {
        const currentUser = getUserInfo() || {};
        const updatedUser = { 
          ...currentUser,
          id: data.id,
          nom: data.lastName,
          prenom: data.firstName,
          email: data.email,
          telephone: data.telephone || currentUser.telephone
        };
        saveUserInfo(updatedUser);
        return updatedUser;
      }
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Failed to load profile. Please try again later.');
    }
  },
  
  updateUserInfo: (updates) => {
    const currentUser = getUserInfo();
    if (currentUser) {
      // Merge the current user data with the updates
      const updatedUser = { ...currentUser, ...updates };
      saveUserInfo(updatedUser);
      return updatedUser;
    }
    return null;
  },
  
  updateProfile: async (userData) => {
    try {
      // Format data according to the new API structure
      const formattedData = {
        firstName: userData.prenom,
        lastName: userData.nom,
        dateOfBirth: userData.dateNaissance,
        gender: userData.genre,
        email: userData.email
      };
      
      const data = await fetchApi("auth/profile", {
        method: "PUT",
        body: formattedData
      });
      
      // Update the stored user info with the response
      const userInfoToUpdate = {
        nom: data.lastName,
        prenom: data.firstName,
        email: data.email,
        telephone: data.telephone || userData.telephone // Preserve telephone
      };
      authService.updateUserInfo(userInfoToUpdate);
      return data;
    } catch (error) {
      console.error('API update failed:', error);
      // Still update local data
      authService.updateUserInfo({
        nom: userData.nom,
        prenom: userData.prenom,
        telephone: userData.telephone
      });
      throw new Error('Profile updated locally, but server update failed. Changes may not persist after logout.');
    }
  },
  
  logout: () => {
    saveToken(null);
    saveUserInfo(null);
  },
  
  isLoggedIn: () => {
    return !!getToken();
  },
  
  getUser: () => {
    return getUserInfo();
  }
};

// Barber service
export const barbierService = {
  getAllBarbers: async () => {
    try {
      const barbers = await fetchApi("barbers");
      console.log('Raw barbers data:', JSON.stringify(barbers));
      
      // Transform barber data to match the format expected by the app
      return barbers.map(barber => ({
        id: barber.id,
        nom: barber.nom || barber.name, // Use nom if available, otherwise name
        photoUrl: barber.photoUrl || barber.photo_url, // Use photoUrl if available, otherwise photo_url
        note: barber.note || barber.rating, // Use note if available, otherwise rating
        nombreAvis: barber.nombreAvis || barber.review_count // Use nombreAvis if available, otherwise review_count
      }));
    } catch (error) {
      console.error('Error fetching barbers:', error);
      throw new Error('Failed to load barbers. Please try again later.');
    }
  },
  
  getBarberById: async (id) => {
    try {
      const barber = await fetchApi(`barbers/${id}`);
      console.log('Raw barber data:', JSON.stringify(barber));
      
      // Transform barber data to match the format expected by the app
      return {
        id: barber.id,
        nom: barber.nom || barber.name, // Use nom if available, otherwise name
        photoUrl: barber.photoUrl || barber.photo_url, // Use photoUrl if available, otherwise photo_url
        note: barber.note || barber.rating, // Use note if available, otherwise rating
        nombreAvis: barber.nombreAvis || barber.review_count // Use nombreAvis if available, otherwise review_count
      };
    } catch (error) {
      console.error(`Error fetching barber ${id}:`, error);
      throw new Error('Failed to load barber details. Please try again later.');
    }
  },
  
  getBarberServices: async (id) => {
    try {
      const services = await fetchApi(`barbers/${id}/services`);
      // Transform service data to match the format expected by the app
      return services.map(service => ({
        id: service.id,
        nom: service.name,
        duree: service.duration,
        prix: service.price,
        BarberId: service.barber_id
      }));
    } catch (error) {
      console.error(`Error fetching services for barber ${id}:`, error);
      throw new Error('Failed to load barber services. Please try again later.');
    }
  }
};

// Appointment service
export const rendezVousService = {
  getUserAppointments: async () => {
    try {
      const appointments = await fetchApi("appointments");
      
      // Transform appointment data to match the format expected by the app
      return appointments.map(appointment => {
        // Conserve exactement la chaîne de date reçue de l'API, sans créer d'objet Date
        // qui causerait une conversion automatique du fuseau horaire
        const appointmentDate = appointment.appointment_date;
        
        // Log pour débogage
        console.log('Date from API:', appointmentDate);
        
        return {
          id: appointment.id,
          date: appointmentDate, // Conserver la date exacte sans conversion
          statut: appointment.status,
          UtilisateurId: appointment.user_id,
          BarbierId: appointment.barber_id,
          ServiceId: appointment.service_id,
          createdAt: appointment.created_at,
          updatedAt: appointment.updated_at,
          // Include related models if available in response
          Barbier: appointment.Barber ? {
            id: appointment.Barber.id,
            nom: appointment.Barber.name,
            photoUrl: appointment.Barber.photo_url
          } : null,
          Service: appointment.Service ? {
            id: appointment.Service.id,
            nom: appointment.Service.name,
            duree: appointment.Service.duration,
            prix: appointment.Service.price
          } : null
        };
      });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to load appointments. Please try again later.');
    }
  },
  
  createAppointment: async (appointmentData) => {
    try {
      // Get the original date
      const originalDate = new Date(appointmentData.date);
      
      // Format the date as a string in Montreal's timezone format
      const year = originalDate.getFullYear();
      const month = String(originalDate.getMonth() + 1).padStart(2, '0');
      const day = String(originalDate.getDate()).padStart(2, '0');
      const hours = String(originalDate.getHours()).padStart(2, '0');
      const minutes = String(originalDate.getMinutes()).padStart(2, '0');
      
      // Create a date string that clearly indicates it's in Montreal time
      const montrealDateString = `${year}-${month}-${day}T${hours}:${minutes}:00`;
      
      // Format data according to the new API structure
      const formattedData = {
        barber_id: appointmentData.barbierId,
        service_id: appointmentData.serviceId,
        // Send the appointment date as a clear Montreal time string
        appointment_date: montrealDateString,
        // Explicitly tell the server this is Montreal time
        timezone: "America/Montreal"
      };
      
      console.log('Original date selected:', originalDate.toString());
      console.log('Montreal date string being sent:', montrealDateString);
      
      const appointment = await fetchApi("appointments", {
        method: "POST",
        body: formattedData
      });
      
      // Store the exact date we selected originally - don't let JavaScript convert it
      const responseDate = montrealDateString;
      
      // Transform to the format expected by the app
      return {
        id: appointment.id,
        date: responseDate, // Use our original date string
        statut: appointment.status,
        UtilisateurId: appointment.user_id,
        BarbierId: appointment.barber_id,
        ServiceId: appointment.service_id,
        createdAt: appointment.created_at,
        updatedAt: appointment.updated_at,
        // Include related models if available in response
        Barbier: appointment.Barber ? {
          id: appointment.Barber.id,
          nom: appointment.Barber.name,
          photoUrl: appointment.Barber.photo_url
        } : null,
        Service: appointment.Service ? {
          id: appointment.Service.id,
          nom: appointment.Service.name,
          duree: appointment.Service.duration,
          prix: appointment.Service.price
        } : null
      };
    } catch (error) {
      console.error('Error creating appointment:', error);
      if (error.message.includes('déjà réservé') || error.message.includes('already booked')) {
        throw new Error('This time slot is already booked. Please select a different time.');
      }
      throw new Error('Failed to book appointment. Please try again later.');
    }
  },
  
  cancelAppointment: async (id) => {
    try {
      const result = await fetchApi(`appointments/${id}/cancel`, {
        method: "PUT"
      });
      return result;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error('Failed to cancel appointment. Please try again later.');
    }
  },
  
  // Check availability of a time slot
  checkAvailability: async (barbierId, date) => {
    try {
      // Convert date to ISO string for API
      const formattedDate = date instanceof Date ? date.toISOString() : date;
      
      return await fetchApi(`appointments/check-availability?barbierId=${barbierId}&date=${formattedDate}`, {
        method: "GET"
      });
    } catch (error) {
      console.error('Error checking availability:', error);
      throw new Error('Failed to check time slot availability. Please try again later.');
    }
  }
};

// Function to refresh user info across the app
export const refreshUserInfo = async () => {
  try {
    if (authService.isLoggedIn()) {
      await authService.getProfile();
    }
    return true;
  } catch (error) {
    console.error('Error refreshing user info:', error);
    return false;
  }
};

// Salon service to get salon information
export const salonService = {
  async getSalonInfo() {
    try {
      console.log('Fetching salon info from API...');
      let response;
      
      try {
        // First attempt with the 'salons/current' endpoint
        response = await fetchApi('salons/current', { method: 'GET' });
      } catch (error) {
        console.log('First endpoint failed, trying fallback endpoint...');
        // Fallback to 'salon' endpoint if the first one fails
        response = await fetchApi('salon', { method: 'GET' });
      }
      
      console.log('Raw salon API response:', JSON.stringify(response));
      
      // Process logo URL - add server base URL if it's a relative path
      let logoUrl = response.logo_url || '~/assets/images/yaniso-logo.png';
      console.log('Original logo_url from API:', response.logo_url);
      
      if (logoUrl && logoUrl.startsWith('/')) {
        logoUrl = `http://10.0.2.2:3000${logoUrl}`;
        console.log('Modified logo URL with base URL:', logoUrl);
      }
      
      // Process image URL - add server base URL if it's a relative path
      let imageUrl = response.image_url || '~/assets/images/salon.jpg';
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `http://10.0.2.2:3000${imageUrl}`;
      }
      
      const result = {
        id: response.id || 1,
        name: response.name || 'Modern Barber Shop',
        address: response.address || '123 Main Street, New York, NY 10001',
        phone: response.phone || '+1 (555) 123-4567',
        email: response.email || 'contact@modernbarbershop.com',
        description: response.description || 'Premium barber services with skilled professionals.',
        businessHours: response.businessHours || [
          { day: 'Monday', open: '9:00', close: '19:00' },
          { day: 'Tuesday', open: '9:00', close: '19:00' },
          { day: 'Wednesday', open: '9:00', close: '19:00' },
          { day: 'Thursday', open: '9:00', close: '19:00' },
          { day: 'Friday', open: '9:00', close: '20:00' },
          { day: 'Saturday', open: '10:00', close: '18:00' },
          { day: 'Sunday', open: 'Closed', close: 'Closed' }
        ],
        socialLinks: response.socialLinks || [
          { name: 'Instagram', url: 'https://instagram.com/modernbarbershop' },
          { name: 'Facebook', url: 'https://facebook.com/modernbarbershop' },
          { name: 'Twitter', url: 'https://twitter.com/modernbarbershop' }
        ],
        logoUrl: logoUrl,
        imageUrl: imageUrl
      };
      
      console.log('Final salon object returned:', JSON.stringify({
        id: result.id,
        name: result.name,
        logoUrl: result.logoUrl
      }));
      
      return result;
    } catch (error) {
      console.error('Error fetching salon info:', error);
      // Return fallback data if API fails
      return {
        id: 1,
        name: 'Modern Barber Shop',
        address: '123 Main Street, New York, NY 10001',
        phone: '+1 (555) 123-4567',
        email: 'contact@modernbarbershop.com',
        description: 'Premium barber services with skilled professionals.',
        businessHours: [
          { day: 'Monday', open: '9:00', close: '19:00' },
          { day: 'Tuesday', open: '9:00', close: '19:00' },
          { day: 'Wednesday', open: '9:00', close: '19:00' },
          { day: 'Thursday', open: '9:00', close: '19:00' },
          { day: 'Friday', open: '9:00', close: '20:00' },
          { day: 'Saturday', open: '10:00', close: '18:00' },
          { day: 'Sunday', open: 'Closed', close: 'Closed' }
        ],
        socialLinks: [
          { name: 'Instagram', url: 'https://instagram.com/modernbarbershop' },
          { name: 'Facebook', url: 'https://facebook.com/modernbarbershop' },
          { name: 'Twitter', url: 'https://twitter.com/modernbarbershop' }
        ],
        logoUrl: '~/assets/images/yaniso-logo.png',
        imageUrl: '~/assets/images/salon.jpg'
      };
    }
  },
  
  getServices: async () => {
    try {
      const response = await fetchApi('/salon/services', { method: 'GET' });
      return response;
    } catch (error) {
      console.error('Error fetching salon services:', error);
      return [
        { id: 1, name: 'Coupe de cheveux', duration: 30, price: 25 },
        { id: 2, name: 'Coupe + Barbe', duration: 45, price: 35 },
        { id: 3, name: 'Barbe', duration: 20, price: 15 },
        { id: 4, name: 'Coupe enfant', duration: 20, price: 20 }
      ];
    }
  }
};

// Publications service to get feed posts
export const publicationService = {
  getAllPublications: async () => {
    try {
      const publications = await fetchApi("publications");
      // Transform to match the expected format in the app
      return publications.map(pub => ({
        id: pub.id,
        title: pub.title,
        description: pub.description,
        imageUrl: pub.image_url,
        reactions: pub.reactions,
        authorName: pub.author_name,
        authorImage: pub.author_image,
        date: new Date(pub.created_at).toLocaleDateString('en-US', { 
          month: 'short', 
          day: '2-digit' 
        }),
        likes: pub.likes,
        liked: false // Client-side state
      }));
    } catch (error) {
      console.error('Error fetching publications:', error);
      throw new Error('Failed to load feed. Please try again later.');
    }
  },
  
  likePublication: async (id) => {
    try {
      const result = await fetchApi(`publications/${id}/like`, {
        method: "POST"
      });
      return result;
    } catch (error) {
      console.error('Error liking publication:', error);
      throw new Error('Failed to like publication. Please try again later.');
    }
  }
};

// App settings service
export const settingsService = {
  refreshSettings: async () => {
    try {
      await config.refreshSettings();
      return true;
    } catch (error) {
      console.error('Error refreshing settings:', error);
      return false;
    }
  },
  
  clearImageCache: () => {
    try {
      // Using a more compatible approach instead of image-cache
      // This is just a placeholder, as the real caching issue is on the server side
      console.log('Image cache clear requested - using cache busting with timestamp instead');
      
      // We're already adding timestamps to URLs in the view components
      return true;
    } catch (error) {
      console.error('Error clearing image cache:', error);
      return false;
    }
  }
};

export default {
  authService,
  barbierService,
  rendezVousService,
  salonService,
  publicationService,
  settingsService,
  refreshUserInfo
};