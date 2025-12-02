import Vue from 'vue'
import VueRouter, { Route, RouteConfig } from 'vue-router'
import Demo from '../views/Demo.vue'
import Api from '../views/Api.vue'
import Start from '../views/Start.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/start',
  },
  {
    path: '/start',
    name: 'Start',
    component: Start
  },
  {
    path: '/demo',
    name: 'Demo',
    component: Demo
  },
  {
    path: '/api',
    name: 'Api',
    component: Api
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes,
  scrollBehavior: function () {
    return {
      selector: 'body',
      offset: {
        x: 0,
        y: 0
      },
      behavior: 'smooth'
    }
  }
})



export default router
