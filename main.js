import Vue from 'vue'
import App from './App.vue'

// stylesheets
import './assets/css/style.css'

// helper functions
import {helpers} from './helpers.js'

Vue.prototype.$helpers = helpers

// main
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
