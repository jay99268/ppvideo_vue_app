<!-- src/views/HomeView.vue -->
<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useMovieStore } from '@/stores/movies'
import { storeToRefs } from 'pinia'
import MovieSection from '@/components/MovieSection.vue'
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-vue-next'

const movieStore = useMovieStore()
const { banners, sections, homeIsLoading, homeError } = storeToRefs(movieStore)

const currentBannerIndex = ref(0)
let intervalId = null

const nextBanner = () => {
  if (banners.value.length > 0) {
    currentBannerIndex.value = (currentBannerIndex.value + 1) % banners.value.length
  }
}

const prevBanner = () => {
  if (banners.value.length > 0) {
    currentBannerIndex.value = (currentBannerIndex.value - 1 + banners.value.length) % banners.value.length
  }
}

const goToBanner = (index) => {
  currentBannerIndex.value = index
}

const startAutoPlay = () => {
  stopAutoPlay() // 先停止，防止重复启动
  intervalId = setInterval(nextBanner, 5000)
}

const stopAutoPlay = () => {
  clearInterval(intervalId)
}

onMounted(async () => {
  await movieStore.fetchHomePageData()
  if (banners.value.length > 0) {
    startAutoPlay()
  }
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div v-if="homeError" class="text-center py-20 text-red-400">
    <AlertTriangle class="mx-auto w-12 h-12 mb-4" />
    <p class="text-xl font-semibold">{{ homeError }}</p>
  </div>
  <div v-else class="space-y-12">
    <!-- Banner Section -->
    <section
      v-if="homeIsLoading"
      class="relative h-96 md:h-[500px] rounded-lg overflow-hidden bg-gray-700"
    >
      <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700"></div>
    </section>
    <section
      v-else-if="banners.length > 0"
      class="relative h-96 md:h-[500px] rounded-lg overflow-hidden"
      @mouseenter="stopAutoPlay"
      @mouseleave="startAutoPlay"
    >
      <transition-group name="fade" tag="div">
        <div
          v-for="(banner, index) in banners"
          :key="banner.imageUrl"
          v-show="index === currentBannerIndex"
          class="absolute inset-0 w-full h-full"
        >
          <img :src="banner.imageUrl" :alt="banner.title" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
          <div class="absolute bottom-0 left-0 p-8">
            <h2 class="text-3xl md:text-4xl font-bold text-white shadow-lg">{{ banner.title }}</h2>
            <p class="text-gray-200 mt-2 max-w-lg hidden md:block">{{ banner.description }}</p>
          </div>
        </div>
      </transition-group>

      <!-- Controls -->
      <button @click="prevBanner" class="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
        <ChevronLeft class="w-6 h-6" />
      </button>
      <button @click="nextBanner" class="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors">
        <ChevronRight class="w-6 h-6" />
      </button>

      <!-- Indicators -->
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        <button
          v-for="(banner, index) in banners"
          :key="`dot-${index}`"
          @click="goToBanner(index)"
          class="w-3 h-3 rounded-full transition-colors"
          :class="index === currentBannerIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'"
        ></button>
      </div>
    </section>

    <!-- Movie Sections -->
    <MovieSection
      v-for="(section, key) in sections"
      :key="key"
      :title="section.title"
      :movies="section.items"
      :has-more="section.hasMore"
      :is-loading="homeIsLoading"
      :is-loading-more="section.isLoadingMore"
      @load-more="movieStore.loadMoreMovies(key)"
    />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
