<!-- src/views/PlayerView.vue -->
<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useMovieStore } from '@/stores/movies'
import { useProfileStore } from '@/stores/profile'
import { storeToRefs } from 'pinia'
import Hls from 'hls.js'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import MovieSection from '@/components/MovieSection.vue'
import { AlertTriangle, Heart } from 'lucide-vue-next'

const route = useRoute()
const movieStore = useMovieStore()
const profileStore = useProfileStore()

const { playerIsLoading, playerError, currentMovieDetail, playData, relatedMovies } = storeToRefs(movieStore)

const videoElement = ref(null) // Template ref for the video element
let hls = null

const qualityLevels = ref([])
const currentQualityLevel = ref(-1) // -1 for auto

const isLoginError = computed(() => playerError.value?.includes('登录'))
const isVipError = computed(() => playerError.value?.includes('VIP'))

function setupHlsPlayer(manifestUrl) {
  if (Hls.isSupported()) {
    if (hls) {
      hls.destroy()
    }
    hls = new Hls()
    hls.loadSource(manifestUrl)
    hls.attachMedia(videoElement.value)

    hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      qualityLevels.value = [{ height: '自动', bitrate: 0 }, ...data.levels]
      currentQualityLevel.value = hls.currentLevel
    })

    hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
      if (hls.autoLevelEnabled) {
        currentQualityLevel.value = -1;
      } else {
        currentQualityLevel.value = data.level;
      }
    })
  } else if (videoElement.value.canPlayType('application/vnd.apple.mpegurl')) {
    videoElement.value.src = manifestUrl
  }
}

function changeQuality(levelIndex) {
  if (hls) {
    hls.currentLevel = levelIndex
    currentQualityLevel.value = levelIndex
  }
}

watch(() => route.params.id, (newId) => {
    if (newId) {
        movieStore.fetchMovieForPlayback(newId)
    }
})

onMounted(() => {
  movieStore.fetchMovieForPlayback(route.params.id)
})

// 当 playData 加载完成后，初始化播放器
watch(playData, (newData) => {
  if (newData?.fileM3u8) {
    setupHlsPlayer(newData.fileM3u8)
  }
})

onUnmounted(() => {
  if (hls) {
    hls.destroy()
  }
})
</script>

<template>
  <div class="space-y-12">
    <div v-if="playerIsLoading">
      <LoadingSpinner />
    </div>
    <div v-else-if="playerError" class="text-center py-20 text-red-400">
      <AlertTriangle class="mx-auto w-12 h-12 mb-4" />
      <p class="text-xl font-semibold">{{ playerError }}</p>
      <div class="mt-6">
        <RouterLink v-if="isLoginError" to="/login" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          前往登录
        </RouterLink>
        <RouterLink v-if="isVipError" to="/vip" class="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors">
          开通VIP
        </RouterLink>
      </div>
    </div>
    <div v-else-if="currentMovieDetail && playData">
      <!-- Player Section -->
      <div class="bg-black rounded-lg overflow-hidden aspect-video">
        <video ref="videoElement" controls class="w-full h-full"></video>
      </div>

      <!-- Info & Controls Section -->
      <div class="bg-gray-800 p-6 rounded-b-lg">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-white">{{ currentMovieDetail.title }}</h1>
            <p class="text-gray-400 mt-2">{{ currentMovieDetail.description }}</p>
          </div>
          <button
            @click="profileStore.toggleFavorite(currentMovieDetail)"
            class="flex items-center space-x-2 text-gray-300 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-700 flex-shrink-0"
          >
            <Heart :fill="profileStore.isFavorited(currentMovieDetail.id) ? 'currentColor' : 'none'" class="w-6 h-6" />
            <span>{{ profileStore.isFavorited(currentMovieDetail.id) ? '已收藏' : '收藏' }}</span>
          </button>
        </div>

        <div v-if="qualityLevels.length > 1" class="mt-4 flex items-center space-x-4">
          <span class="text-gray-400 text-sm">选择清晰度:</span>
          <button
            v-for="(level, index) in qualityLevels"
            :key="level.height"
            @click="changeQuality(index - 1)"
            :class="[
              'px-3 py-1 text-sm rounded-md',
              currentQualityLevel === (index - 1) ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
            ]"
          >
            {{ level.height }}
          </button>
        </div>
      </div>
    </div>

    <!-- Related Movies Section -->
    <MovieSection
        v-if="relatedMovies && relatedMovies.length > 0"
        title="相关推荐"
        :movies="relatedMovies"
        :has-more="false"
    />
  </div>
</template>

<style scoped>
.aspect-video {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio */
}
.aspect-video video {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}
</style>
