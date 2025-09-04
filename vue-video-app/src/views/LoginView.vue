<!-- src/views/LoginView.vue -->
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Mail, Lock, Loader2 } from 'lucide-vue-next'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref(null)

async function handleLogin() {
  isLoading.value = true
  error.value = null
  const result = await authStore.login({ email: email.value, password: password.value })
  if (!result.success) {
    error.value = result.message
  }
  isLoading.value = false
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 class="text-3xl font-bold text-center text-white mb-8">欢迎回来</h2>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="email"
            type="email"
            placeholder="邮箱"
            required
            class="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            v-model="password"
            type="password"
            placeholder="密码"
            required
            class="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div v-if="error" class="text-red-400 text-sm text-center">
          {{ error }}
        </div>
        <button
          :disabled="isLoading"
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Loader2 v-if="isLoading" class="animate-spin mr-2" />
          <span>登录</span>
        </button>
      </form>
      <p class="text-center text-gray-400 text-sm mt-6">
        还没有账户？
        <RouterLink to="/register" class="font-medium text-indigo-400 hover:text-indigo-300">立即注册</RouterLink>
      </p>
    </div>
  </div>
</template>
