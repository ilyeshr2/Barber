//src/store/modules/appointment.js
import AppointmentService from '@/services/appointment.service'

export default {
  namespaced: true,
  state: {
    appointments: [],
    todayAppointments: [],
    upcomingAppointments: [],
    currentAppointment: null,
    loading: false,
    error: null
  },
  getters: {
    appointments: state => state.appointments,
    todayAppointments: state => state.todayAppointments,
    upcomingAppointments: state => state.upcomingAppointments,
    currentAppointment: state => state.currentAppointment,
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
    SET_APPOINTMENTS(state, appointments) {
      state.appointments = appointments
    },
    SET_TODAY_APPOINTMENTS(state, appointments) {
      state.todayAppointments = appointments
    },
    SET_UPCOMING_APPOINTMENTS(state, appointments) {
      state.upcomingAppointments = appointments
    },
    SET_CURRENT_APPOINTMENT(state, appointment) {
      state.currentAppointment = appointment
    },
    ADD_APPOINTMENT(state, appointment) {
      state.appointments.push(appointment)
      
      // Update today appointments if applicable
      const today = new Date().toISOString().split('T')[0]
      const appointmentDate = new Date(appointment.date).toISOString().split('T')[0]
      if (appointmentDate === today) {
        state.todayAppointments.push(appointment)
      }
      
      // Update upcoming appointments
      if (new Date(appointment.date) >= new Date()) {
        state.upcomingAppointments.push(appointment)
        // Sort upcoming appointments by date
        state.upcomingAppointments.sort((a, b) => new Date(a.date) - new Date(b.date))
      }
    },
    UPDATE_APPOINTMENT(state, updatedAppointment) {
      // Update in all appointment lists
      const lists = ['appointments', 'todayAppointments', 'upcomingAppointments']
      
      lists.forEach(listName => {
        const index = state[listName].findIndex(a => a.id === updatedAppointment.id)
        if (index !== -1) {
          state[listName].splice(index, 1, updatedAppointment)
        }
      })
      
      // If this is the current appointment, update it too
      if (state.currentAppointment && state.currentAppointment.id === updatedAppointment.id) {
        state.currentAppointment = updatedAppointment
      }
    },
    REMOVE_APPOINTMENT(state, appointmentId) {
      // Remove from all appointment lists
      const lists = ['appointments', 'todayAppointments', 'upcomingAppointments']
      
      lists.forEach(listName => {
        state[listName] = state[listName].filter(a => a.id !== appointmentId)
      })
      
      // If this is the current appointment, clear it
      if (state.currentAppointment && state.currentAppointment.id === appointmentId) {
        state.currentAppointment = null
      }
    }
  },
  actions: {
    async fetchAppointments({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointments = await AppointmentService.getAllAppointments()
        commit('SET_APPOINTMENTS', appointments)
        return appointments
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchTodayAppointments({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointments = await AppointmentService.getTodayAppointments()
        commit('SET_TODAY_APPOINTMENTS', appointments)
        return appointments
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchUpcomingAppointments({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointments = await AppointmentService.getUpcomingAppointments()
        commit('SET_UPCOMING_APPOINTMENTS', appointments)
        return appointments
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createAppointment({ commit }, appointmentData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointment = await AppointmentService.createAppointment(appointmentData)
        commit('ADD_APPOINTMENT', appointment)
        return appointment
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updateAppointment({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointment = await AppointmentService.updateAppointment(id, data)
        commit('UPDATE_APPOINTMENT', appointment)
        return appointment
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async cancelAppointment({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointment = await AppointmentService.cancelAppointment(id)
        commit('UPDATE_APPOINTMENT', appointment)
        return appointment
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async completeAppointment({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const appointment = await AppointmentService.completeAppointment(id)
        commit('UPDATE_APPOINTMENT', appointment)
        return appointment
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deleteAppointment({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await AppointmentService.deleteAppointment(id)
        commit('REMOVE_APPOINTMENT', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}