// src/stores/subscription.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'

export const useSubscriptionStore = defineStore('subscription', () => {
  const plans = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  async function fetchPlans() {
    if (plans.value.length > 0) return

    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/subscription/plans')
      plans.value = response.data
    } catch (err) {
      console.error('获取VIP套餐失败:', err)
      error.value = '无法加载VIP套餐，请稍后重试。'
    } finally {
      isLoading.value = false
    }
  }

  return { plans, isLoading, error, fetchPlans }
})
