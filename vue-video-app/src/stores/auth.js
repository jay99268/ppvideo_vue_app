// src/stores/auth.js
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'
import router from '@/router'
import { useProfileStore } from './profile'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const token = ref(localStorage.getItem('token') || null)
  const isEmailVerificationEnabled = ref(true) // 默认为 true，安全起见
  const newUserVipDays = ref(0) // 新增：用于存储赠送天数

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function fetchRegistrationSettings() {
    try {
      const response = await api.get('/auth/registration-settings')
      isEmailVerificationEnabled.value = response.data.enableEmailVerification
      newUserVipDays.value = response.data.newUserVipDays // 保存赠送天数
    } catch (error) {
      console.error('获取注册配置失败:', error)
      // 如果获取失败，保持默认值为 true
      isEmailVerificationEnabled.value = true
      newUserVipDays.value = 0 // 获取失败则默认为0
    }
  }

  async function login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      const data = response.data

      token.value = data.token
      user.value = {
        username: data.username,
        email: data.email,
        vipStatus: data.vipStatus,
        vipExpiresAt: data.vipExpiresAt
      }

      localStorage.setItem('token', token.value)
      localStorage.setItem('user', JSON.stringify(user.value))

      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`

      const profileStore = useProfileStore()
      await profileStore.fetchFavoriteIds()

      const redirectPath = router.currentRoute.value.query.redirect || '/'
      router.push(redirectPath)
      return { success: true }
    } catch (error) {
      console.error('登录失败:', error)
      return { success: false, message: error.response?.data || '登录失败，请重试' }
    }
  }

  async function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']

    const profileStore = useProfileStore()
    profileStore.clearFavorites()

    await router.push({ name: 'home' })
  }

  function tryAutoLogin() {
    const storedToken = localStorage.getItem('token')
    if (storedToken && user.value) {
      token.value = storedToken
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      const profileStore = useProfileStore()
      profileStore.fetchFavoriteIds()
    }
  }

  async function sendVerificationCode(email) {
    try {
      const response = await api.post('/auth/send-verification-code', { email })
      return { success: true, message: response.data.message, code: response.data.verificationCode }
    } catch (error) {
      return { success: false, message: error.response?.data || '验证码发送失败' }
    }
  }

  async function register(details) {
    try {
      const response = await api.post('/auth/register', details)
      return { success: true, message: response.data.message }
    } catch (error) {
      return { success: false, message: error.response?.data || '注册失败' }
    }
  }

  return { user, token, isAuthenticated, isEmailVerificationEnabled, newUserVipDays, fetchRegistrationSettings, login, logout, tryAutoLogin, sendVerificationCode, register }
})
