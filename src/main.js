import Vue from 'vue'
import App from './App.vue'
import router from './router';
import { gapi } from 'gapi-script';

Vue.config.productionTip = false;

import './assets/css/main.css';

function initGapi() {
  return new Promise((resolve, reject) => {
    gapi.load('client:auth2', async () => {
      try {
        await gapi.client.init({
          apiKey: 'AIzaSyAqbKge33KtAEyokx7cyFsUO2u0B-uQ3XE',
          clientId: '601871836773-fq4crbbco6cr9qknm3h15mdn5fcqsf23.apps.googleusercontent.com',
          scope: 'https://www.googleapis.com/auth/tasks',
          prompt: 'consent',
          callback: (response) => {
            this.createIntegration(response.code);
          },
        });
        resolve(); 
      } catch (error) {
        console.error('Błąd inicjalizacji gapi:', error);
        reject(error);
      }
    });
  });
}

initGapi()
  .then(() => {
    console.log('gapi zainicjowane!');
    new Vue({
      render: h => h(App),
      router,
    }).$mount('#app');
  })
  .catch(error => {
    console.error('Nie udało się zainicjować gapi:', error);
  });