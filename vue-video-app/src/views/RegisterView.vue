<!-- src/views/RegisterView.vue -->
<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { User, Mail, Lock, KeyRound, Loader2, Gift } from 'lucide-vue-next' // 引入 Gift 图标

const authStore = useAuthStore()
const router = useRouter()

const { isEmailVerificationEnabled, newUserVipDays } = storeToRefs(authStore)

const username = ref('')
const email = ref('')
const password = ref('')
const verificationCode = ref('')

const isLoading = ref(false)
const error = ref(null)
const message = ref(null)

const isSendingCode = ref(false)
const countdown = ref(60)
const verificationCodeForDev = ref(null)

onMounted(() => {
  authStore.fetchRegistrationSettings()
})

async function handleSendCode() {
  if (isSendingCode.value) return
  isSendingCode.value = true
  message.value = null
  error.value = null
  verificationCodeForDev.value = null

  const result = await authStore.sendVerificationCode(email.value)
  if (result.success) {
    message.value = result.message
    verificationCodeForDev.value = result.code
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value === 0) {
        clearInterval(timer)
        isSendingCode.value = false
        countdown.value = 60
      }
    }, 1000)
  } else {
    error.value = result.message
    isSendingCode.value = false
  }
}

async function handleRegister() {
  isLoading.value = true
  error.value = null
  message.value = null

  const payload = {
    username: username.value,
    email: email.value,
    password: password.value,
  }

  if (isEmailVerificationEnabled.value) {
    payload.verificationCode = verificationCode.value
  }

  const result = await authStore.register(payload)

  if (result.success) {
    message.value = result.message
    setTimeout(() => router.push('/login'), 2000)
  } else {
    error.value = result.message
  }
  isLoading.value = false
}
</script>

<template>
  <div class="flex items-center justify-center min-h-[60vh]">
    <div class="w-full max-w-md bg-gray-800 p-8 rounded-lg shadow-xl">
      <h2 class="text-3xl font-bold text-center text-white mb-8">创建账户</h2>

      <!-- 核心修复：使用 .value 来访问 ref 的值 -->
      <div v-if="newUserVipDays > 0" class="mb-6 p-4 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-500/50 rounded-lg text-center">
        <div class="flex items-center justify-center">
            <Gift class="w-6 h-6 text-yellow-400 mr-3" />
            <p class="font-semibold text-white">限时福利！立即注册</p>
        </div>
        <p class="text-sm text-gray-300 mt-1">即可免费获赠 <span class="font-bold text-yellow-400">{{ newUserVipDays }}</span> 天VIP会员！</p>
      </div>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <div class="relative">
          <User class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="username" type="text" placeholder="用户名" required class="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="email" type="email" placeholder="邮箱" required class="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input v-model="password" type="password" placeholder="密码" required class="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>

        <!-- 核心修复：使用 .value 来访问 ref 的值 -->
        <div v-if="isEmailVerificationEnabled" class="flex space-x-4">
          <div class="relative flex-grow">
            <KeyRound class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input v-model="verificationCode" type="text" placeholder="验证码" :required="isEmailVerificationEnabled" class="w-full bg-gray-700 text-white pl-10 pr-4 py-3 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button
            @click="handleSendCode"
            :disabled="isSendingCode"
            type="button"
            class="w-32 bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSendingCode ? `${countdown}s` : '发送验证码' }}
          </button>
        </div>

        <!-- Messages -->
        <div v-if="error" class="text-red-400 text-sm text-center">{{ error }}</div>
        <div v-if="message" class="text-green-400 text-sm text-center">{{ message }}</div>
        <div v-if="isEmailVerificationEnabled && verificationCodeForDev" class="text-yellow-400 text-sm text-center bg-gray-700 p-2 rounded">
          开发模式提示：验证码为 {{ verificationCodeForDev }}
        </div>

        <button
          :disabled="isLoading"
          type="submit"
          class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <Loader2 v-if="isLoading" class="animate-spin mr-2" />
          <span>注册</span>
        </button>
      </form>
      <p class="text-center text-gray-400 text-sm mt-6">
        已经有账户了？
        <RouterLink to="/login" class="font-medium text-indigo-400 hover:text-indigo-300">立即登录</RouterLink>
      </p>
    </div>
  </div>
</template>
