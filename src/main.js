import Vue from 'vue';
import VueLogger from 'vuejs-logger';
import App from './App.vue';

Vue.config.productionTip = false;

const isProduction = process.env.NODE_ENV === 'production';

// logger
const options = {
  // isEnabled: true,
  logLevel: isProduction ? 'error' : 'debug',
  // stringifyArguments: false,
  showLogLevel: true,
  showMethodName: true,
  // separator: '|',
  showConsoleColors: true,
};
Vue.use(VueLogger, options);

// директивы
Vue.directive('focus', {
  inserted: (el) => {
    el.focus();
  },
});

new Vue({
  render: h => h(App),
}).$mount('#app');
