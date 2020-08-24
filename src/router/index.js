import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

  const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/github',
    name: 'github',
    beforeEnter () {
      location.href = 'https://github.com/kulapio/kulap-near-token-airdrop-poc'
    }
  }
]

const router = new VueRouter({
  routes
})

export default router
