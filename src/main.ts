import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import CompositionView from './views/CompositionView.vue'
import './services/subscriptionService' // Initialize subscription service

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/LandingView.vue') },
    { path: '/compose', component: CompositionView },
    { path: '/pricing', component: () => import('./views/PricingView.vue') },
    { path: '/checkout', component: () => import('./views/CheckoutView.vue') },
    { path: '/payment-success', component: () => import('./views/PaymentSuccessView.vue') }
  ]
})

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')