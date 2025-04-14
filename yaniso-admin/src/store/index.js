// Update src/store/index.js to include new modules
import { createStore } from 'vuex'
import auth from './modules/auth'
import barbiers from './modules/barbiers'
import services from './modules/services'
import appointments from './modules/appointments'
import clients from './modules/clients'
import salon from './modules/salon'
import publications from './modules/publications'

export default createStore({
  modules: {
    auth,
    barbiers,
    services,
    appointments,
    clients,
    salon,
    publications
  }
})