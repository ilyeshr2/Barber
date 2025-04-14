//src/store/modules/barbiers.js
import BarbierService from '@/services/barbier.service'

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
      state.barbiers = barbiers
    },
    SET_CURRENT_BARBIER(state, barbier) {
      state.currentBarbier = barbier
    },
    ADD_BARBIER(state, barbier) {
      state.barbiers.push(barbier)
    },
    UPDATE_BARBIER(state, updatedBarbier) {
      const index = state.barbiers.findIndex(b => b.id === updatedBarbier.id)
      if (index !== -1) {
        state.barbiers.splice(index, 1, updatedBarbier)
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
    
    async createBarbier({ commit }, barbierData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const barbier = await BarbierService.createBarbier(barbierData)
        commit('ADD_BARBIER', barbier)
        return barbier
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateBarbier({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const barbier = await BarbierService.updateBarbier(id, data)
        commit('UPDATE_BARBIER', barbier)
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