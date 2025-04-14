// src/store/modules/salon.js - NEW FILE
import SalonService from '@/services/salon.service'

export default {
  namespaced: true,
  state: {
    salonInfo: null,
    businessHours: [],
    loading: false,
    error: null
  },
  getters: {
    salonInfo: state => state.salonInfo,
    businessHours: state => state.businessHours,
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
    SET_SALON_INFO(state, salonInfo) {
      state.salonInfo = salonInfo
    },
    SET_BUSINESS_HOURS(state, businessHours) {
      state.businessHours = businessHours
    }
  },
  actions: {
    async fetchSalonInfo({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const salonData = await SalonService.getSalonInfo()
        commit('SET_SALON_INFO', salonData)
        
        if (salonData.businessHours) {
          commit('SET_BUSINESS_HOURS', salonData.businessHours)
        }
        
        return salonData
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateSalonInfo({ commit }, salonData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const updatedSalon = await SalonService.updateSalonInfo(salonData)
        commit('SET_SALON_INFO', updatedSalon)
        return updatedSalon
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateBusinessHours({ commit }, hoursData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const updatedHours = await SalonService.updateBusinessHours(hoursData)
        commit('SET_BUSINESS_HOURS', updatedHours)
        return updatedHours
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}
