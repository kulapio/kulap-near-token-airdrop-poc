import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Buefy from 'buefy'
import bignumber from 'bignumber.js'
// Style
import 'buefy/dist/buefy.css'

Vue.use(Buefy)
Vue.config.productionTip = false
Vue.filter('numberWithCommas', (number, format = { groupSeparator: ',', groupSize: 3, decimalSeparator: '.' }) => {
  return bignumber(number).toFormat(format).toString()
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
