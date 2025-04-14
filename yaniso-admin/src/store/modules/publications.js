// src/store/modules/publications.js - NEW FILE
import PublicationService from '@/services/publication.service'

export default {
  namespaced: true,
  state: {
    publications: [],
    currentPublication: null,
    loading: false,
    error: null
  },
  getters: {
    publications: state => state.publications,
    currentPublication: state => state.currentPublication,
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
    SET_PUBLICATIONS(state, publications) {
      state.publications = publications
    },
    SET_CURRENT_PUBLICATION(state, publication) {
      state.currentPublication = publication
    },
    ADD_PUBLICATION(state, publication) {
      state.publications.unshift(publication) // Add to beginning of array for newest first
    },
    UPDATE_PUBLICATION(state, updatedPublication) {
      const index = state.publications.findIndex(p => p.id === updatedPublication.id)
      if (index !== -1) {
        state.publications.splice(index, 1, updatedPublication)
      }
      
      if (state.currentPublication && state.currentPublication.id === updatedPublication.id) {
        state.currentPublication = updatedPublication
      }
    },
    REMOVE_PUBLICATION(state, publicationId) {
      state.publications = state.publications.filter(p => p.id !== publicationId)
      
      if (state.currentPublication && state.currentPublication.id === publicationId) {
        state.currentPublication = null
      }
    }
  },
  actions: {
    async fetchPublications({ commit }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const publications = await PublicationService.getAllPublications()
        commit('SET_PUBLICATIONS', publications)
        return publications
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async fetchPublicationById({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const publication = await PublicationService.getPublicationById(id)
        commit('SET_CURRENT_PUBLICATION', publication)
        return publication
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async createPublication({ commit }, publicationData) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const publication = await PublicationService.createPublication(publicationData)
        commit('ADD_PUBLICATION', publication)
        return publication
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async updatePublication({ commit }, { id, data }) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        const publication = await PublicationService.updatePublication(id, data)
        commit('UPDATE_PUBLICATION', publication)
        return publication
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    },
    
    async deletePublication({ commit }, id) {
      commit('SET_LOADING', true)
      commit('SET_ERROR', null)
      
      try {
        await PublicationService.deletePublication(id)
        commit('REMOVE_PUBLICATION', id)
      } catch (error) {
        commit('SET_ERROR', error.message)
        throw error
      } finally {
        commit('SET_LOADING', false)
      }
    }
  }
}
