// app/app.js
import Vue from 'nativescript-vue';
import Connexion from './views/Connexion';
import PeloStudio from './views/PeloStudio';
import { authService } from './services/api';

// Import dialog elements
import { prompt, alert, confirm } from '@nativescript/core/ui/dialogs';
Vue.prototype.$prompt = prompt;
Vue.prototype.$alert = alert;
Vue.prototype.$confirm = confirm;

// Disable Vue production tips
Vue.config.silent = false;

// Determine the initial screen based on authentication status
let initialComponent = authService.isLoggedIn() ? PeloStudio : Connexion;

new Vue({
  render: h => h('frame', [h(initialComponent)])
}).$start();