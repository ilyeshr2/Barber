// app/services/api.js
import * as http from "@nativescript/core/http";
import * as ApplicationSettings from "@nativescript/core/application-settings";

const API_URL = "http://10.0.2.2:3000/api";

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

// HTTP requests with error handling
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
      headers: headers
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
      throw new Error(data.message || "Une erreur est survenue");
    }
    
    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
};

// Auth service
export const authService = {
  signup: async (userData) => {
    try {
      const data = await fetchApi("auth/signup", {
        method: "POST",
        body: userData
      });
      
      if (data.token) {
        saveToken(data.token);
        saveUserInfo({
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
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
      const data = await fetchApi("auth/login", {
        method: "POST",
        body: credentials
      });
      
      if (data.token) {
        saveToken(data.token);
        saveUserInfo({
          id: data.id,
          nom: data.nom,
          prenom: data.prenom,
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
          ...data,
          // Make sure telephone is preserved if it's not in the profile
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
      const data = await fetchApi("auth/profile", {
        method: "PUT",
        body: userData
      });
      
      // Update the stored user info with the response
      const userInfoToUpdate = {
        nom: data.nom,
        prenom: data.prenom,
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
        telephone: userData.telephone // Preserve telephone
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
      return await fetchApi("barbers");
    } catch (error) {
      console.error('Error fetching barbers:', error);
      throw new Error('Failed to load barbers. Please try again later.');
    }
  },
  
  getBarberById: async (id) => {
    try {
      return await fetchApi(`barbers/${id}`);
    } catch (error) {
      console.error(`Error fetching barber ${id}:`, error);
      throw new Error('Failed to load barber details. Please try again later.');
    }
  },
  
  getBarberServices: async (id) => {
    try {
      return await fetchApi(`barbers/${id}/services`);
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
      return await fetchApi("appointments");
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new Error('Failed to load appointments. Please try again later.');
    }
  },
  
  createAppointment: async (appointmentData) => {
    try {
      return await fetchApi("appointments", {
        method: "POST",
        body: appointmentData
      });
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
      return await fetchApi(`appointments/${id}/cancel`, {
        method: "PUT"
      });
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw new Error('Failed to cancel appointment. Please try again later.');
    }
  },
  
  // New function to check availability of a time slot
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

export default {
  authService,
  barbierService,
  rendezVousService,
  refreshUserInfo
};