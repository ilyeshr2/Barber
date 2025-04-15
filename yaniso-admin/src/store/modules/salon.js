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
        const salonInfo = await SalonService.getSalonInfo()
        commit('SET_SALON_INFO', salonInfo)
        
        if (salonInfo.businessHours) {
          commit('SET_BUSINESS_HOURS', salonInfo.businessHours)
        }
        
        return salonInfo
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateSalonInfo({ commit, dispatch }, salonData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        console.log('Salon store: updateSalonInfo action received data', salonData)
        
        const updatedSalon = await SalonService.updateSalonInfo(salonData)
        console.log('Salon store: received response from service:', updatedSalon)
        
        // Normalize field names if necessary
        const normalizedSalon = {
          ...updatedSalon,
          logoUrl: updatedSalon.logo_url || updatedSalon.logoUrl,
          imageUrl: updatedSalon.image_url || updatedSalon.imageUrl
        }
        
        console.log('Salon store: normalized salon data:', normalizedSalon)
        commit('SET_SALON_INFO', normalizedSalon)
        return normalizedSalon
      } catch (error) {
        console.error('Salon store: error in updateSalonInfo action:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateBusinessHours({ commit, dispatch }, hoursData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const updatedHours = await SalonService.updateBusinessHours(hoursData)
        
        // Update business hours in state
        await dispatch('fetchSalonInfo')
        
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
