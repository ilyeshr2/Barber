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
        // Map backend fields to frontend fields
        const mappedClients = clients.map(client => ({
          id: client.id,
          prenom: client.first_name,
          nom: client.last_name,
          email: client.email,
          telephone: client.telephone,
          genre: client.gender,
          dateNaissance: client.date_of_birth,
          photoUrl: client.photo_url
        }))
        commit('SET_CLIENTS', mappedClients)
        return mappedClients
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
        // Map backend fields to frontend fields
        const mappedClient = {
          id: client.id,
          prenom: client.first_name,
          nom: client.last_name,
          email: client.email,
          telephone: client.telephone,
          genre: client.gender,
          dateNaissance: client.date_of_birth,
          photoUrl: client.photo_url
        }
        commit('SET_CURRENT_CLIENT', mappedClient)
        return mappedClient
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
        
        // Map backend appointment fields to frontend fields
        const mappedAppointments = appointments.map(appointment => ({
          id: appointment.id,
          date: appointment.appointment_date,
          statut: appointment.status === 'confirmed' ? 'confirmé' :
                 appointment.status === 'cancelled' ? 'annulé' :
                 appointment.status === 'completed' ? 'terminé' : 'confirmé',
          UtilisateurId: appointment.user_id,
          BarbierId: appointment.barber_id,
          ServiceId: appointment.service_id,
          createdAt: appointment.created_at,
          updatedAt: appointment.updated_at
        }))
        
        return mappedAppointments
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
        // Map backend fields to frontend fields
        const mappedClient = {
          id: client.id,
          prenom: client.first_name,
          nom: client.last_name,
          email: client.email,
          telephone: client.telephone,
          genre: client.gender,
          dateNaissance: client.date_of_birth,
          photoUrl: client.photo_url
        }
        commit('ADD_CLIENT', mappedClient)
        return mappedClient
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
        // Map backend fields to frontend fields
        const mappedClient = {
          id: client.id,
          prenom: client.first_name,
          nom: client.last_name,
          email: client.email,
          telephone: client.telephone,
          genre: client.gender,
          dateNaissance: client.date_of_birth,
          photoUrl: client.photo_url
        }
        commit('UPDATE_CLIENT', mappedClient)
        return mappedClient
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