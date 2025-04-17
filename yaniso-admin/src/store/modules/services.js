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
      
      // Update barbier services for each barber
      if (service.BarberIds && service.BarberIds.length > 0) {
        service.BarberIds.forEach(barbierId => {
          if (!state.barbierServices[barbierId]) {
            state.barbierServices[barbierId] = [];
          }
          state.barbierServices[barbierId].push(service);
        });
      } 
      // Backward compatibility for single BarberId
      else if (service.BarberId && !service.BarberIds) {
        if (!state.barbierServices[service.BarberId]) {
          state.barbierServices[service.BarberId] = [];
        }
        state.barbierServices[service.BarberId].push(service);
      }
    },
    UPDATE_SERVICE(state, updatedService) {
      // Update in allServices
      const index = state.allServices.findIndex(s => s.id === updatedService.id)
      if (index !== -1) {
        // Get the old service to find barbers that might have been removed
        const oldService = state.allServices[index];
        state.allServices.splice(index, 1, updatedService)
        
        // For old barbers, remove the service if they're not in the new barber list
        if (oldService.BarberIds && oldService.BarberIds.length > 0) {
          oldService.BarberIds.forEach(oldBarbierId => {
            // If the barber is not in the new list, remove the service from this barber
            if (!updatedService.BarberIds?.includes(oldBarbierId)) {
              if (state.barbierServices[oldBarbierId]) {
                state.barbierServices[oldBarbierId] = state.barbierServices[oldBarbierId]
                  .filter(s => s.id !== updatedService.id);
              }
            }
          });
        } 
        // Backward compatibility for single BarberId
        else if (oldService.BarberId && !oldService.BarberIds) {
          if (oldService.BarberId !== updatedService.BarberId && state.barbierServices[oldService.BarberId]) {
            state.barbierServices[oldService.BarberId] = state.barbierServices[oldService.BarberId]
              .filter(s => s.id !== updatedService.id);
          }
        }
      }
      
      // Add/update the service for all new barbers
      if (updatedService.BarberIds && updatedService.BarberIds.length > 0) {
        updatedService.BarberIds.forEach(barbierId => {
          // Initialize the array if needed
          if (!state.barbierServices[barbierId]) {
            state.barbierServices[barbierId] = [];
          }
          
          // Check if service already exists for this barber
          const barbierServiceIndex = state.barbierServices[barbierId]
            .findIndex(s => s.id === updatedService.id);
            
          if (barbierServiceIndex !== -1) {
            // Update existing service
            state.barbierServices[barbierId].splice(barbierServiceIndex, 1, updatedService);
          } else {
            // Add new service to this barber
            state.barbierServices[barbierId].push(updatedService);
          }
        });
      }
      // Backward compatibility for single BarberId
      else if (updatedService.BarberId && !updatedService.BarberIds) {
        // Initialize the array if needed
        if (!state.barbierServices[updatedService.BarberId]) {
          state.barbierServices[updatedService.BarberId] = [];
        }
        
        // Check if service already exists for this barber
        const barbierServiceIndex = state.barbierServices[updatedService.BarberId]
          .findIndex(s => s.id === updatedService.id);
          
        if (barbierServiceIndex !== -1) {
          // Update existing service
          state.barbierServices[updatedService.BarberId].splice(barbierServiceIndex, 1, updatedService);
        } else {
          // Add new service to this barber
          state.barbierServices[updatedService.BarberId].push(updatedService);
        }
      }
    },
    REMOVE_SERVICE(state, serviceId) {
      // Find the service to get its barbers before removal
      const service = state.allServices.find(s => s.id === serviceId)
      
      // Remove from allServices
      state.allServices = state.allServices.filter(s => s.id !== serviceId)
      
      if (service) {
        // Remove from all barbierServices
        if (service.BarberIds && service.BarberIds.length > 0) {
          service.BarberIds.forEach(barbierId => {
            if (state.barbierServices[barbierId]) {
              state.barbierServices[barbierId] = state.barbierServices[barbierId]
                .filter(s => s.id !== serviceId);
            }
          });
        }
        // Backward compatibility for single BarberId
        else if (service.BarberId && !service.BarberIds) {
          if (state.barbierServices[service.BarberId]) {
            state.barbierServices[service.BarberId] = state.barbierServices[service.BarberId]
              .filter(s => s.id !== serviceId);
          }
        }
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
        console.log('Raw services data from API:', JSON.stringify(services))
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