//src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.css'

// Import our custom CSS
import './assets/styles/main.scss'

// Import Bootstrap JS with Popper
import * as bootstrap from 'bootstrap'

const app = createApp(App)

app.use(router)
app.use(store)

// Make Bootstrap available globally
window.bootstrap = bootstrap

app.mount('#app')