<!-- src/components/MovieCard.vue -->
<script setup>
import { RouterLink } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { Heart } from 'lucide-vue-next'

const props = defineProps({
  movie: {
    type: Object,
    required: true
  }
})

const profileStore = useProfileStore()
</script>
<template>
  <div class="group relative overflow-hidden rounded-lg shadow-lg bg-gray-800 aspect-[3/4]">
    <RouterLink :to="{ name: 'play', params: { id: movie.id } }">
      <img
        :src="movie.posterUrlVertical"
        :alt="movie.title"
        class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div class="absolute bottom-0 left-0 p-3 w-full">
        <h4 class="text-white font-bold truncate">{{ movie.title }}</h4>
      </div>
    </RouterLink>

    <span v-if="movie.monetizationType === 'vip'" class="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">
      VIP
    </span>

    <button
      @click.stop="profileStore.toggleFavorite(movie)"
      class="absolute bottom-2 right-2 p-2 rounded-full bg-black/30 text-white hover:text-red-500 transition-colors"
    >
      <Heart :fill="profileStore.isFavorited(movie.id) ? 'currentColor' : 'none'" class="w-5 h-5" />
    </button>
  </div>
</template>
