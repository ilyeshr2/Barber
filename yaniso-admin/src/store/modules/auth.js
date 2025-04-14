// src/store/modules/auth.js - Updated for dynamic data
import AuthService from '@/services/auth.service';

const user = JSON.parse(localStorage.getItem('user'));

const initialState = {
  status: {
    loggedIn: !!user,
    loading: false,
    error: null
  },
  user: user || null
};

export default {
  namespaced: true,
  state: initialState,
  getters: {
    isAuthenticated: state => state.status.loggedIn,
    user: state => state.user,
    loading: state => state.status.loading,
    error: state => state.status.error
  },
  mutations: {
    LOGIN_REQUEST(state) {
      state.status.loading = true;
      state.status.error = null;
    },
    LOGIN_SUCCESS(state, user) {
      state.status.loggedIn = true;
      state.status.loading = false;
      state.user = user;
    },
    LOGIN_FAILURE(state, error) {
      state.status.loggedIn = false;
      state.status.loading = false;
      state.status.error = error;
      state.user = null;
    },
    LOGOUT(state) {
      state.status.loggedIn = false;
      state.user = null;
    },
    PROFILE_REQUEST(state) {
      state.status.loading = true;
      state.status.error = null;
    },
    PROFILE_SUCCESS(state, user) {
      state.status.loading = false;
      state.user = { ...state.user, ...user };
    },
    PROFILE_FAILURE(state, error) {
      state.status.loading = false;
      state.status.error = error;
    }
  },
  actions: {
    async login({ commit }, credentials) {
      commit('LOGIN_REQUEST');
      
      try {
        const user = await AuthService.login(credentials);
        commit('LOGIN_SUCCESS', user);
        return user;
      } catch (error) {
        commit('LOGIN_FAILURE', error.message);
        throw error;
      }
    },
    
    logout({ commit }) {
      AuthService.logout();
      commit('LOGOUT');
    },
    
    async checkAuth({ commit, state }) {
      if (state.status.loggedIn && state.user) {
        try {
          // Just validate that the token works by fetching profile
          await AuthService.getProfile();
        } catch (error) {
          // If there's an error, token is probably invalid
          AuthService.logout();
          commit('LOGOUT');
        }
      }
    },
    
    async getProfile({ commit }) {
      commit('PROFILE_REQUEST');
      
      try {
        const user = await AuthService.getProfile();
        commit('PROFILE_SUCCESS', user);
        return user;
      } catch (error) {
        commit('PROFILE_FAILURE', error.message);
        throw error;
      }
    },
    
    async updateProfile({ commit }, userData) {
      commit('PROFILE_REQUEST');
      
      try {
        const user = await AuthService.updateProfile(userData);
        commit('PROFILE_SUCCESS', user);
        return user;
      } catch (error) {
        commit('PROFILE_FAILURE', error.message);
        throw error;
      }
    }
  }
};