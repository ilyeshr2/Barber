//src/store/modules/services.js
import ServiceService from '@/services/service.service'

export default {
  namespaced: true,
  state: {
    allServices: [],
    barbierServices: {},
    currentService: null,
    loading: false,
    error: null
  },
  getters: {
    allServices: state => state.allServices,
    barbierServices: state => barbierId => {
      return state.barbierServices[barbierId] || []
    },
    currentService: state => state.currentService,
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
    SET_ALL_SERVICES(state, services) {
      state.allServices = services
    },
    SET_BARBIER_SERVICES(state, { barbierId, services }) {
      state.barbierServices = {
        ...state.barbierServices,
        [barbierId]: services
      }
    },
    SET_CURRENT_SERVICE(state, service) {
      state.currentService = service
    },
    ADD_SERVICE(state, service) {
      state.allServices.push(service)
      
      // Update barbier services if available
      if (state.barbierServices[service.BarberId]) {
        state.barbierServices[service.BarberId].push(service)
      }
    },
    UPDATE_SERVICE(state, updatedService) {
      // Update in allServices
      const index = state.allServices.findIndex(s => s.id === updatedService.id)
      if (index !== -1) {
        state.allServices.splice(index, 1, updatedService)
      }
      
      // Update in barbierServices if available
      const barbierId = updatedService.BarberId
      if (state.barbierServices[barbierId]) {
        const barbierIndex = state.barbierServices[barbierId].findIndex(s => s.id === updatedService.id)
        if (barbierIndex !== -1) {
          state.barbierServices[barbierId].splice(barbierIndex, 1, updatedService)
        } else {
          state.barbierServices[barbierId].push(updatedService)
        }
      }
    },
    REMOVE_SERVICE(state, serviceId) {
      // Remove from allServices
      const service = state.allServices.find(s => s.id === serviceId)
      state.allServices = state.allServices.filter(s => s.id !== serviceId)
      
      // Remove from barbierServices if available
      if (service && state.barbierServices[service.BarberId]) {
        state.barbierServices[service.BarberId] = state.barbierServices[service.BarberId].filter(s => s.id !== serviceId)
      }
    }
  },
  actions: {
    async fetchAllServices({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const services = await ServiceService.getAllServices()
        commit('SET_ALL_SERVICES', services)
        return services
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchBarbierServices({ commit }, barbierId) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const services = await ServiceService.getServicesByBarbierId(barbierId)
        commit('SET_BARBIER_SERVICES', { barbierId, services })
        return services
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createService({ commit }, serviceData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const service = await ServiceService.createService(serviceData)
        commit('ADD_SERVICE', service)
        return service
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateService({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const service = await ServiceService.updateService(id, data)
        commit('UPDATE_SERVICE', service)
        return service
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteService({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await ServiceService.deleteService(id)
        commit('REMOVE_SERVICE', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}