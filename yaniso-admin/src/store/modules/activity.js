import ActivityService from '@/services/activity.service'

export default {
  namespaced: true,
  state: {
    activities: [],
    loading: false,
    error: null
  },
  getters: {
    activities: state => state.activities,
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
    SET_ACTIVITIES(state, activities) {
      state.activities = activities
    }
  },
  actions: {
    async fetchRecentActivities({ commit }, limit = 5) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        console.log('Fetching recent activities with limit:', limit)
        const activities = await ActivityService.getRecentActivities(limit)
        console.log('Received activities:', activities.length)
        commit('SET_ACTIVITIES', activities)
        return activities
      } catch (error) {
        console.error('Error in fetchRecentActivities action:', error)
        commit('SET_ERROR', error.message || 'Failed to load recent activities')
        // Set empty activities to avoid breaking the UI
        commit('SET_ACTIVITIES', [])
        return []
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
} 