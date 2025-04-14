//src/store/modules/clients.js
import ClientService from '@/services/client.service'

export default {
  namespaced: true,
  state: {
    clients: [],
    currentClient: null,
    loading: false,
    error: null
  },
  getters: {
    clients: state => state.clients,
    currentClient: state => state.currentClient,
    loading: state => state.loading,
    error: state => state.error
  },
  mutations: {
    SET_LOADING(state, loading) {
      state.loading = loading
    },
    SET_ERROR(state, error) {
      state.error = error
    },
    SET_CLIENTS(state, clients) {
      state.clients = clients
    },
    SET_CURRENT_CLIENT(state, client) {
      state.currentClient = client
    },
    ADD_CLIENT(state, client) {
      state.clients.push(client)
    },
    UPDATE_CLIENT(state, updatedClient) {
      const index = state.clients.findIndex(c => c.id === updatedClient.id)
      if (index !== -1) {
        state.clients.splice(index, 1, updatedClient)
      }
      
      if (state.currentClient && state.currentClient.id === updatedClient.id) {
        state.currentClient = updatedClient
      }
    },
    REMOVE_CLIENT(state, clientId) {
      state.clients = state.clients.filter(c => c.id !== clientId)
      
      if (state.currentClient && state.currentClient.id === clientId) {
        state.currentClient = null
      }
    }
  },
  actions: {
    async fetchClients({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const clients = await ClientService.getAllClients()
        commit('SET_CLIENTS', clients)
        return clients
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchClientById({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const client = await ClientService.getClientById(id)
        commit('SET_CURRENT_CLIENT', client)
        return client
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchClientAppointments({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointments = await ClientService.getClientAppointments(id)
        return appointments
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createClient({ commit }, clientData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const client = await ClientService.createClient(clientData)
        commit('ADD_CLIENT', client)
        return client
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateClient({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const client = await ClientService.updateClient(id, data)
        commit('UPDATE_CLIENT', client)
        return client
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteClient({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await ClientService.deleteClient(id)
        commit('REMOVE_CLIENT', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}