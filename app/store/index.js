// app/store/index.js
import Vue from 'nativescript-vue';
import Vuex from 'vuex';
import * as ApplicationSettings from '@nativescript/core/application-settings';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    utilisateur: null,
    token: null
  },

  getters: {
    isLoggedIn: state => !!state.token,
    utilisateurInfo: state => state.utilisateur
  },

  mutations: {
    SET_TOKEN(state, token) {
      state.token = token;
      if (token) {
        ApplicationSettings.setString('token', token);
      } else {
        ApplicationSettings.remove('token');
      }
    },

    SET_UTILISATEUR(state, utilisateur) {
      state.utilisateur = utilisateur;
    },

    LOGOUT(state) {
      state.token = null;
      state.utilisateur = null;
      ApplicationSettings.remove('token');
    },
    UPDATE_USER_INFO(state, updates) {
        if (state.utilisateur) {
          state.utilisateur = { ...state.utilisateur, ...updates };
          // Also update in ApplicationSettings
          if (updates) {
            const userInfo = ApplicationSettings.getString('user', '');
            if (userInfo) {
              const parsedInfo = JSON.parse(userInfo);
              ApplicationSettings.setString('user', JSON.stringify({ ...parsedInfo, ...updates }));
            }
          }
        }
    },
    
  },

  actions: {
    // Simple action pour tester
    connexion({ commit }, credentials) {
      // Simuler une connexion réussie
      console.log('Connexion avec', credentials);
      commit('SET_TOKEN', 'fake-token-123');
      commit('SET_UTILISATEUR', { id: 1, nom: 'Test' });
      return Promise.resolve({ success: true });
    },

    deconnexion({ commit }) {
      commit('LOGOUT');
    },
    updateUserInfo({ commit }, updates) {
        commit('UPDATE_USER_INFO', updates);
        return Promise.resolve({ success: true });
      }
    
  }
});

export default store;
