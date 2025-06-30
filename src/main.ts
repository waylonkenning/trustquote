import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import CompositionView from './views/CompositionView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: CompositionView }
  ]
})

const pinia = createPinia()

createApp(App)
  .use(router)
  .use(pinia)
  .mount('#app')