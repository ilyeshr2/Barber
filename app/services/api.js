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
  signup: (userData) => {
    return fetchApi("auth/signup", {
      method: "POST",
      body: userData
    }).then(data => {
      if (data.token) {
        saveToken(data.token);
        saveUserInfo({
          id: data.id,
          nom: data.nom,
          prenom: data.prenom
        });
      }
      return data;
    });
  },
  
  login: (credentials) => {
    return fetchApi("auth/login", {
      method: "POST",
      body: credentials
    }).then(data => {
      if (data.token) {
        saveToken(data.token);
        saveUserInfo({
          id: data.id,
          nom: data.nom,
          prenom: data.prenom
        });
      }
      return data;
    });
  },
  
  getProfile: () => {
    return fetchApi("auth/profile");
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
  
  updateProfile: (userData) => {
    return fetchApi("auth/profile", {
      method: "PUT",
      body: userData
    }).then(data => {
      // Update the stored user info with the response
      const userInfoToUpdate = {
        nom: data.nom,
        prenom: data.prenom
      };
      authService.updateUserInfo(userInfoToUpdate);
      return data;
    }).catch(error => {
      console.log('API update failed:', error);
      // Still update local data
      authService.updateUserInfo({
        nom: userData.nom,
        prenom: userData.prenom
      });
      throw error;
    });
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
  getAllBarbers: () => {
    return fetchApi("barbers");
  },
  
  getBarberById: (id) => {
    return fetchApi(`barbers/${id}`);
  },
  
  getBarberServices: (id) => {
    return fetchApi(`barbers/${id}/services`);
  }
};

// Appointment service
export const rendezVousService = {
  getUserAppointments: () => {
    return fetchApi("appointments");
  },
  
  createAppointment: (appointmentData) => {
    return fetchApi("appointments", {
      method: "POST",
      body: appointmentData
    });
  },
  
  cancelAppointment: (id) => {
    return fetchApi(`appointments/${id}/cancel`, {
      method: "PUT"
    });
  }
};

export default {
  authService,
  barbierService,
  rendezVousService
};