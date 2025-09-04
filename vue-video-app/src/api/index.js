// src/api/index.js
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  // 直接指向您的后端 API 地址
  baseURL: 'https://pipiav.cc/api',
  //baseURL: 'https://localhost:7033/api',
  timeout: 10000
})

// 请求拦截器: 附加 Token
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器: 处理 401 错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    // 检查错误是否为401，并且请求的不是登录接口或播放接口
    if (error.response && error.response.status === 401 && originalRequest.url !== '/auth/login' && !originalRequest.url.includes('/play')) {
      const authStore = useAuthStore()
      authStore.logout()
    }
    return Promise.reject(error)
  }
)

export default api
