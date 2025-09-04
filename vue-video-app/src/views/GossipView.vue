<!-- src/views/GossipView.vue -->
<script setup>
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import { useGossipStore } from '@/stores/gossip'
import { storeToRefs } from 'pinia'
import GossipCard from '@/components/GossipCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { AlertTriangle, ChevronsUp, ChevronsDown, Loader2 } from 'lucide-vue-next'
import { debounce } from '@/utils/debounce'

const gossipStore = useGossipStore()
const { posts, lastSeenId, isLoading, isLoadingHistory, isLoadingNew, error, hasMoreHistory, hasMoreNew } = storeToRefs(gossipStore)

const postElements = ref([])
let observer = null

// 创建防抖函数，每当用户停止滚动1秒后，更新进度
const debouncedUpdateProgress = debounce((postId) => {
  gossipStore.updateProgress(postId)
}, 1000)

onMounted(() => {
  gossipStore.fetchInitialPosts()

  observer = new IntersectionObserver((entries) => {
    const visibleEntries = entries.filter(e => e.isIntersecting)
    if (visibleEntries.length > 0) {
      // 找到可视区域最顶部的帖子
      visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
      const topmostPostId = visibleEntries[0].target.dataset.postId
      if (topmostPostId) {
        debouncedUpdateProgress(parseInt(topmostPostId))
      }
    }
  }, {
    rootMargin: '0px 0px -50% 0px', // 帖子进入上半屏才算"看到"
    threshold: 0.1
  })
})

// 监听 posts 数组的变化，以便重新观察DOM元素
watch(posts, () => {
  nextTick(() => {
    if (observer) {
      observer.disconnect()
      postElements.value.forEach(el => {
        if (el) observer.observe(el)
      })
    }
  })
}, { deep: true })

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
  }
  gossipStore.reset()
})
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-white mb-8 text-center">吃瓜中心</h1>

    <div v-if="isLoading">
      <LoadingSpinner />
    </div>
    <div v-else-if="error" class="text-center py-20 text-red-400">
      <AlertTriangle class="mx-auto w-12 h-12 mb-4" />
      <p class="text-xl font-semibold">{{ error }}</p>
    </div>
    <div v-else class="space-y-6">
      <!-- 加载历史按钮 -->
      <div v-if="posts.length > 0" class="text-center">
        <button
          v-if="hasMoreHistory"
          @click="gossipStore.loadHistory()"
          :disabled="isLoadingHistory"
          class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center mx-auto"
        >
          <Loader2 v-if="isLoadingHistory" class="animate-spin mr-2 w-5 h-5" />
          <ChevronsUp v-else class="mr-2 w-5 h-5" />
          <span>加载历史内容</span>
        </button>
        <p v-else class="text-gray-500 text-sm">
          — 已加载全部历史 —
        </p>
      </div>

      <!-- 帖子列表 -->
      <div
        v-for="(post, index) in posts"
        :key="post.id"
        :ref="el => { if (el) postElements[index] = el }"
        :data-post-id="post.id"
      >
        <!-- 上次看到这里提示 -->
        <div
          v-if="post.id === lastSeenId"
          class="flex items-center text-center my-4"
        >
          <div class="flex-grow border-t border-dashed border-gray-600"></div>
          <span class="flex-shrink-0 mx-4 text-sm text-indigo-400 font-semibold">上次看到这里</span>
          <div class="flex-grow border-t border-dashed border-gray-600"></div>
        </div>
        <GossipCard :post="post" />
      </div>

      <!-- 加载更多按钮 -->
      <div v-if="posts.length > 0" class="text-center">
        <button
          v-if="hasMoreNew"
          @click="gossipStore.loadNew()"
          :disabled="isLoadingNew"
          class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center mx-auto"
        >
          <Loader2 v-if="isLoadingNew" class="animate-spin mr-2 w-5 h-5" />
          <ChevronsDown v-else class="mr-2 w-5 h-5" />
          <span>加载更多</span>
        </button>
        <p v-else class="text-gray-500 text-sm">
          — 没有更多了 —
        </p>
      </div>
    </div>
  </div>
</template>
