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
        const activities = await ActivityService.getRecentActivities(limit)
        commit('SET_ACTIVITIES', activities)
        return activities
      } catch (error) {
        commit('SET_ERROR', error.message || 'Failed to load recent activities')
        return []
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
} 