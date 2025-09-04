<!-- src/views/ProfileView.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'
import MovieCard from '@/components/MovieCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { Loader2, AlertTriangle, Gem } from 'lucide-vue-next'

const authStore = useAuthStore()
const profileStore = useProfileStore()

const { user } = storeToRefs(authStore)
const { history, favorites } = storeToRefs(profileStore)

const activeTab = ref('favorites') // 默认显示我的收藏

const tabs = [
  { key: 'favorites', name: '我的收藏' },
  { key: 'history', name: '观看记录' }
]

const isVip = computed(() => user.value?.vipStatus === 'active')

const formattedExpiryDate = computed(() => {
    if (isVip.value && user.value.vipExpiresAt) {
        return new Date(user.value.vipExpiresAt).toLocaleDateString('zh-CN', {
            year: 'numeric', month: 'long', day: 'numeric'
        });
    }
    return '';
});

function selectTab(tabKey) {
  activeTab.value = tabKey
  if (tabKey === 'history' && history.value.items.length === 0) {
    profileStore.fetchHistory()
  } else if (tabKey === 'favorites' && favorites.value.items.length === 0) {
    profileStore.fetchFavorites()
  }
}

onMounted(() => {
  profileStore.reset();
  profileStore.fetchFavorites() // 页面加载时首先获取收藏列表
})

onUnmounted(() => {
    profileStore.reset();
})

const currentTabData = computed(() => {
    return activeTab.value === 'history' ? history.value : favorites.value;
});

const loadMore = () => {
    if (activeTab.value === 'history') {
        profileStore.loadMoreHistory();
    } else {
        profileStore.loadMoreFavorites();
    }
}

</script>

<template>
  <div class="space-y-8">
    <!-- User Info Header -->
    <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 md:space-x-6 bg-gray-800 p-6 rounded-lg">
      <div class="flex items-center space-x-6">
        <img
          :src="user?.avatarUrl || `https://ui-avatars.com/api/?name=${user?.username}&background=4f46e5&color=fff`"
          alt="User Avatar"
          class="w-24 h-24 rounded-full border-4 border-gray-700"
        />
        <div>
          <h1 v-if="isVip" class="text-2xl font-bold text-yellow-400 flex items-center">
            <Gem class="w-6 h-6 mr-2" />
            尊敬的会员：{{ user?.username }}
          </h1>
          <h1 v-else class="text-3xl font-bold text-white">{{ user?.username }}</h1>

          <p class="text-gray-400 mt-1">{{ user?.email }}</p>
          <p v-if="isVip" class="text-sm text-gray-400 mt-2">
            会员到期时间：{{ formattedExpiryDate }}
          </p>
        </div>
      </div>
      <RouterLink to="/vip" class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-6 py-2 rounded-md font-bold transition-all shadow-lg w-full md:w-auto text-center">
        {{ isVip ? '续费VIP会员' : '开通VIP会员' }}
      </RouterLink>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-700">
      <nav class="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="selectTab(tab.key)"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === tab.key
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Tab Content -->
    <div>
      <div v-if="currentTabData.isLoading">
        <LoadingSpinner />
      </div>
      <div v-else-if="currentTabData.error" class="text-center py-20 text-red-400">
        <AlertTriangle class="mx-auto w-12 h-12 mb-4" />
        <p class="text-xl font-semibold">{{ currentTabData.error }}</p>
      </div>
      <div v-else-if="currentTabData.items.length === 0" class="text-center py-20 text-gray-500">
        <p>这里空空如也~</p>
      </div>
      <div v-else>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          <MovieCard v-for="movie in currentTabData.items" :key="movie.id" :movie="movie" />
        </div>
        <div class="text-center mt-8">
          <button
            v-if="currentTabData.hasMore"
            @click="loadMore"
            :disabled="currentTabData.isLoadingMore"
            class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
          >
            <Loader2 v-if="currentTabData.isLoadingMore" class="animate-spin mr-2 w-5 h-5" />
            <span>{{ currentTabData.isLoadingMore ? '加载中...' : '加载更多' }}</span>
          </button>
          <p v-else class="text-gray-500 text-sm">
            — 没有更多了 —
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
