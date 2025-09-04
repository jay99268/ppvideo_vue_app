<!-- src/views/CategoriesView.vue -->
<script setup>
import { onMounted, watch, computed } from 'vue'
import { useMovieStore } from '@/stores/movies'
import { storeToRefs } from 'pinia'
import MovieCard from '@/components/MovieCard.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import { AlertTriangle, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  monetizationType: {
    type: String,
    default: null
  }
})

const movieStore = useMovieStore()
const {
  genres, regions, tagList, filteredMovies,
  categoryIsLoading, categoryIsLoadingMore, categoryHasMore, categoryError, activeFilters
} = storeToRefs(movieStore)

const sortOptions = [
  { name: '最新上线', value: 'published_at' },
  { name: '热门排序', value: 'release_year' },
]

const pageTitle = computed(() => {
    if (props.monetizationType === 'vip') return '会员专享区'
    if (props.monetizationType === 'free') return '免费专享区'
    return '全部分类'
})

watch(() => props.monetizationType, (newType) => {
  movieStore.setMonetizationTypeAndFetch(newType)
}, { immediate: true })

onMounted(() => {
  movieStore.fetchCategoriesAndTags()
})
</script>

<template>
  <div class="space-y-8">
    <h1 class="text-3xl font-bold text-white">{{ pageTitle }}</h1>

    <!-- Filters Section - 在免费区 (monetizationType === 'free') 时隐藏 -->
    <div v-if="props.monetizationType !== 'free'" class="bg-gray-800 p-4 rounded-lg space-y-4">
      <!-- Genre Filter -->
      <div class="flex items-center flex-wrap">
        <span class="text-gray-400 mr-4 w-12 text-sm">类型:</span>
        <button
          v-for="genre in genres" :key="genre"
          @click="movieStore.setFilter('genre', genre)"
          :class="['px-3 py-1 text-sm rounded-md mr-2 mb-2', activeFilters.genre === genre ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600']"
        >
          {{ genre }}
        </button>
      </div>
      <!-- Region Filter -->
      <div class="flex items-center flex-wrap">
        <span class="text-gray-400 mr-4 w-12 text-sm">地区:</span>
        <button
          v-for="region in regions" :key="region"
          @click="movieStore.setFilter('region', region)"
          :class="['px-3 py-1 text-sm rounded-md mr-2 mb-2', activeFilters.region === region ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600']"
        >
          {{ region }}
        </button>
      </div>
      <!-- Tag Filter -->
      <div class="flex items-center flex-wrap">
        <span class="text-gray-400 mr-4 w-12 text-sm">标签:</span>
        <button
          v-for="tag in tagList" :key="tag"
          @click="movieStore.setFilter('tag', tag)"
          :class="['px-3 py-1 text-sm rounded-md mr-2 mb-2', activeFilters.tag === tag ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600']"
        >
          {{ tag }}
        </button>
      </div>
      <!-- Sort Filter -->
      <div class="flex items-center flex-wrap">
        <span class="text-gray-400 mr-4 w-12 text-sm">排序:</span>
        <button
          v-for="sort in sortOptions" :key="sort.value"
          @click="movieStore.setFilter('sortBy', sort.value)"
          :class="['px-3 py-1 text-sm rounded-md mr-2 mb-2', activeFilters.sortBy === sort.value ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600']"
        >
          {{ sort.name }}
        </button>
      </div>
    </div>

    <!-- Movies Grid Section -->
    <div v-if="categoryIsLoading">
      <LoadingSpinner />
    </div>
    <div v-else-if="categoryError" class="text-center py-20 text-red-400">
      <AlertTriangle class="mx-auto w-12 h-12 mb-4" />
      <p class="text-xl font-semibold">{{ categoryError }}</p>
    </div>
    <div v-else-if="filteredMovies.length === 0" class="text-center py-20 text-gray-500">
      <p>没有找到符合条件的影片。</p>
    </div>
    <div v-else>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        <MovieCard v-for="movie in filteredMovies" :key="movie.id" :movie="movie" />
      </div>

      <!-- Load More Button Section -->
      <div v-if="filteredMovies.length > 0" class="text-center mt-8">
        <button
          v-if="categoryHasMore"
          @click="movieStore.loadMoreFilteredMovies"
          :disabled="categoryIsLoadingMore"
          class="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          <Loader2 v-if="categoryIsLoadingMore" class="animate-spin mr-2 w-5 h-5" />
          <span>{{ categoryIsLoadingMore ? '加载中...' : '加载更多' }}</span>
        </button>
        <p v-else class="text-gray-500 text-sm">
          — 没有更多了 —
        </p>
      </div>
    </div>
  </div>
</template>
