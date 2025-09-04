// src/main.js
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

app.use(createPinia())

// 在使用 router 之前，尝试自动登录
const authStore = useAuthStore()
authStore.tryAutoLogin()

app.use(router)

app.mount('#app')
