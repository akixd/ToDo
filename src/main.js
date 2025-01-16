import Vue from 'vue'
import App from './App.vue'
import router from './router';
import { gapi } from 'gapi-script';

Vue.config.productionTip = false

import './assets/css/main.css';

new Vue({
  render: h => h(App),
  router,
}).$mount('#app');

gapi.load('client:auth2', () => {
  gapi.client.init({
    apiKey: '',
    clientId: '',
    discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest'],
    scope: 'https://www.googleapis.com/auth/tasks',
  });
});