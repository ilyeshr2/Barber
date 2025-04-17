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
        
        if (salonInfo.businessHours && Array.isArray(salonInfo.businessHours)) {
          commit('SET_BUSINESS_HOURS', salonInfo.businessHours)
        } else {
          console.warn('No business hours received from API')
        }
        
        return salonInfo
      } catch (error) {
        console.error('Error fetching salon info:', error)
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
        const updatedSalon = await SalonService.updateSalonInfo(salonData)
        
        // Normalize field names if necessary
        const normalizedSalon = {
          ...updatedSalon,
          logoUrl: updatedSalon.logo_url || updatedSalon.logoUrl,
          imageUrl: updatedSalon.image_url || updatedSalon.imageUrl
        }
        
        commit('SET_SALON_INFO', normalizedSalon)
        return normalizedSalon
      } catch (error) {
        console.error('Error in updateSalonInfo action:', error)
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
        
        // Instead of immediately dispatching fetchSalonInfo, let's extract and save the hours
        if (updatedHours && updatedHours.business_hours) {
          // Convert snake_case to camelCase for frontend
          const formattedHours = updatedHours.business_hours.map(day => ({
            dayOfWeek: day.day_of_week,
            isOpen: day.is_open,
            openTime: day.open_time,
            closeTime: day.close_time
          }))
          
          commit('SET_BUSINESS_HOURS', formattedHours)
        } else {
          console.warn('No business_hours in the response, falling back to fetchSalonInfo')
          // Fall back to fetchSalonInfo to refresh data
          await dispatch('fetchSalonInfo')
        }
        
        return updatedHours
      } catch (error) {
        console.error('Error in updateBusinessHours action:', error)
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}
