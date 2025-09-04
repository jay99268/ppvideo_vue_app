<!-- src/views/VipView.vue -->
<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { ShieldCheck, Clapperboard, Zap, Gem } from 'lucide-vue-next'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

const subscriptionStore = useSubscriptionStore()
const authStore = useAuthStore()

const { plans, isLoading, error } = storeToRefs(subscriptionStore)
const { isAuthenticated, user } = storeToRefs(authStore)

const selectedPlanId = ref(null)

const isVip = computed(() => isAuthenticated.value && user.value?.vipStatus === 'active')

const formattedExpiryDate = computed(() => {
  if (isVip.value && user.value.vipExpiresAt) {
    return new Date(user.value.vipExpiresAt).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
  return ''
})

const privileges = [
  { icon: ShieldCheck, title: '高清画质', description: '享受1080P/4K超高清视觉盛宴' },
  { icon: Clapperboard, title: '专属片库', description: '海量VIP专属影片免费看' },
  { icon: Zap, title: '无广告', description: '纯净观影体验，告别广告打扰' },
  { icon: Gem, title: '尊贵标识', description: '彰显您的VIP会员身份' }
]

onMounted(() => {
  subscriptionStore.fetchPlans()
})

// 监听套餐数据加载完成，然后设置默认选中项
watch(plans, (newPlans) => {
  if (newPlans.length > 0 && !selectedPlanId.value) {
    const recommendedPlan = newPlans.find((p) => p.tag)
    if (recommendedPlan) {
      selectedPlanId.value = recommendedPlan.id
    } else {
      selectedPlanId.value = newPlans[0].id
    }
  }
})
</script>

<template>
  <div class="text-white">
    <!-- Banner -->
    <div class="bg-gray-800 rounded-lg p-8 md:p-12 mb-12 text-center">
      <h1 class="text-4xl md:text-5xl font-bold text-yellow-400">
        {{ isVip ? '续费VIP会员' : '升级VIP会员' }}
      </h1>
      <p v-if="isVip" class="mt-4 text-lg text-gray-300">
        您的会员将于 {{ formattedExpiryDate }} 到期
      </p>
      <p v-else class="mt-4 text-lg text-gray-300">畅想海量影片，尊享顶级特权</p>
    </div>

    <!-- Privileges -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-center mb-8">会员专属特权</h2>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div v-for="privilege in privileges" :key="privilege.title" class="text-center">
          <component :is="privilege.icon" class="w-12 h-12 mx-auto text-indigo-400 mb-4" />
          <h3 class="font-semibold">{{ privilege.title }}</h3>
          <p class="text-sm text-gray-400 mt-1">{{ privilege.description }}</p>
        </div>
      </div>
    </div>

    <!-- Subscription Plans -->
    <div class="mb-12">
      <h2 class="text-2xl font-bold text-center mb-8">选择您的套餐</h2>
      <div v-if="isLoading"><LoadingSpinner /></div>
      <div v-else-if="error" class="text-center text-red-400">{{ error }}</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.id"
          @click="selectedPlanId = plan.id"
          :class="[
            'border-2 rounded-lg p-6 text-center transition-all duration-300 cursor-pointer relative',
            selectedPlanId === plan.id
              ? 'border-yellow-400 bg-gray-700/50'
              : 'border-gray-700 bg-gray-900/50 hover:bg-gray-700'
          ]"
        >
          <h4 class="text-lg font-semibold">{{ plan.name }}</h4>
          <p class="text-gray-400 line-through text-sm mt-1 h-5">
            <span v-if="plan.originalPriceUsd">原价 ${{ plan.originalPriceUsd }}</span>
          </p>
          <p class="text-4xl font-bold text-yellow-400 my-4">${{ plan.priceUsd }}</p>
          <p class="text-gray-400 text-sm h-10">{{ plan.description }}</p>
          <span
            v-if="plan.tag"
            class="absolute -top-3 right-4 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full transform rotate-12"
          >
            {{ plan.tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- Payment -->
    <div class="text-center">
      <button
        class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-12 py-3 rounded-lg text-lg font-bold transition-all shadow-lg"
      >
        {{ isVip ? '确认续费' : '确认支付' }}
      </button>
    </div>
  </div>
</template>
