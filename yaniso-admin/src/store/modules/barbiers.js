//src/store/modules/barbiers.js
import BarbierService from '@/services/barbier.service'

// Helper function to normalize barber data from API
const normalizeBarber = (barber) => {
  // Ensure note/rating is a valid number
  const rating = barber.rating || barber.note;
  const numericRating = typeof rating === 'number' ? rating : 
                         typeof rating === 'string' ? parseFloat(rating) : 5.0;
                         
  // Map API fields to frontend field names if needed
  return {
    id: barber.id,
    nom: barber.name || barber.nom,
    photoUrl: barber.photo_url || barber.photoUrl,
    note: !isNaN(numericRating) ? numericRating : 5.0,
    nombreAvis: barber.review_count || barber.nombreAvis || 0,
    salonId: barber.salon_id || barber.salonId || 1,
    isActive: barber.is_active !== undefined ? barber.is_active : true
  }
}

export default {
  namespaced: true,
  state: {
    barbiers: [],
    currentBarbier: null,
    loading: false,
    error: null
  },
  getters: {
    barbiers: state => state.barbiers,
    currentBarbier: state => state.currentBarbier,
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
    SET_BARBIERS(state, barbiers) {
      state.barbiers = barbiers.map(b => normalizeBarber(b))
    },
    SET_CURRENT_BARBIER(state, barbier) {
      state.currentBarbier = normalizeBarber(barbier)
    },
    ADD_BARBIER(state, barbier) {
      state.barbiers.push(normalizeBarber(barbier))
    },
    UPDATE_BARBIER(state, updatedBarbier) {
      const normalizedBarber = normalizeBarber(updatedBarbier)
      const index = state.barbiers.findIndex(b => b.id === normalizedBarber.id)
      if (index !== -1) {
        state.barbiers.splice(index, 1, normalizedBarber)
      }
    },
    REMOVE_BARBIER(state, barbierId) {
      state.barbiers = state.barbiers.filter(b => b.id !== barbierId)
    }
  },
  actions: {
    async fetchBarbiers({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const barbiers = await BarbierService.getAllBarbers()
        commit('SET_BARBIERS', barbiers)
        return barbiers
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchBarbierById({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const barbier = await BarbierService.getBarbierById(id)
        commit('SET_CURRENT_BARBIER', barbier)
        return barbier
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createBarbier({ commit, dispatch }, barbierData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // If data is not FormData, map field names for API
        let mappedData = barbierData;
        if (!(barbierData instanceof FormData) && typeof barbierData === 'object') {
          // Map frontend field names to backend field names if not already mapped
          if (barbierData.nom && !barbierData.name) {
            mappedData = {
              name: barbierData.nom,
              rating: barbierData.note,
              review_count: barbierData.nombreAvis,
              salon_id: barbierData.salonId || 1
            };
          }
        }
        
        const barbier = await BarbierService.createBarbier(mappedData)
        commit('ADD_BARBIER', barbier)
        // Reload barbiers list to ensure consistency
        await dispatch('fetchBarbiers')
        return barbier
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateBarbier({ commit, dispatch }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        // If data is not FormData, map field names for API
        let mappedData = data;
        if (!(data instanceof FormData) && typeof data === 'object') {
          // Map frontend field names to backend field names if not already mapped
          if (data.nom && !data.name) {
            mappedData = {
              name: data.nom,
              rating: data.note,
              review_count: data.nombreAvis,
              salon_id: data.salonId || 1
            };
          }
        }
        
        const barbier = await BarbierService.updateBarbier(id, mappedData)
        commit('UPDATE_BARBIER', barbier)
        // Reload barbiers list to ensure consistency
        await dispatch('fetchBarbiers')
        return barbier
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteBarbier({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await BarbierService.deleteBarbier(id)
        commit('REMOVE_BARBIER', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}