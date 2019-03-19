import Vue from 'vue';
import App from './App.vue';
import store from './store';
import router from './routes';
import Snake from './utils/preloader';
import http from './utils/httpRequest';

import './config';
import './assets/js/autosize';

Vue.use(Snake, router);
Vue.config.productionTisp = false;
Vue.prototype.$http = http;

const vm = new Vue({
  store,
  router,
  render: page => page(App),
  mounted: () => document.dispatchEvent(new Event("x-app-rendered")),
  mounted: () => document.dispatchEvent(new Event("x-app-rendered")),
}).$mount('#app', true);

window.vm = vm;
window.dayjs = require('dayjs');
