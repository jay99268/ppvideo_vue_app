<!-- src/components/MovieSection.vue -->
<script setup>
import MovieCard from '@/components/MovieCard.vue'
import MovieCardSkeleton from '@/components/MovieCardSkeleton.vue'
import { Loader2 } from 'lucide-vue-next'

defineProps({
  title: String,
  movies: Array,
  hasMore: Boolean,
  isLoading: Boolean, // 新增：用于控制初始加载状态
  isLoadingMore: Boolean
})

const emit = defineEmits(['load-more'])
</script>

<template>
  <section>
    <h3 class="text-2xl font-bold text-white mb-6">{{ title }}</h3>

    <!-- 初始加载时显示骨架屏 -->
    <div v-if="isLoading" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
      <MovieCardSkeleton v-for="i in 6" :key="i" />
    </div>

    <!-- 加载完成后显示影片 -->
    <div v-else>
      <div
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6"
      >
        <MovieCard v-for="movie in movies" :key="movie.id" :movie="movie" />
      </div>

      <div v-if="movies && movies.length > 0" class="text-center mt-8">
        <button
          v-if="hasMore"
          @click="emit('load-more')"
          :disabled="isLoadingMore"
          class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          <Loader2 v-if="isLoadingMore" class="animate-spin mr-2 w-5 h-5" />
          <span>{{ isLoadingMore ? '加载中...' : '加载更多' }}</span>
        </button>
        <p v-else class="text-gray-500 text-sm">
          — 没有更多了 —
        </p>
      </div>
    </div>
  </section>
</template>
