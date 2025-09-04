<!-- src/components/ImageLightbox.vue -->
<script setup>
import { onMounted, onUnmounted, computed } from 'vue'
import { useUiStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'

const uiStore = useUiStore()
const { lightboxImages, currentLightboxIndex } = storeToRefs(uiStore)

const currentImage = computed(() => lightboxImages.value[currentLightboxIndex.value])

const handleKeydown = (e) => {
  if (e.key === 'Escape') uiStore.closeLightbox()
  if (e.key === 'ArrowRight') uiStore.nextImage()
  if (e.key === 'ArrowLeft') uiStore.prevImage()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center animate-fade-in" @click.self="uiStore.closeLightbox">
    <!-- Close Button -->
    <button @click="uiStore.closeLightbox" class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
      <X class="w-8 h-8" />
    </button>

    <!-- Prev Button -->
    <button @click="uiStore.prevImage" class="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 bg-black/20 rounded-full">
      <ChevronLeft class="w-10 h-10" />
    </button>

    <!-- Image Display -->
    <div class="relative max-w-4xl max-h-[90vh]">
        <transition name="slide" mode="out-in">
            <img :key="currentImage.mediaUrl" :src="currentImage.mediaUrl" class="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </transition>
    </div>

    <!-- Next Button -->
    <button @click="uiStore.nextImage" class="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 bg-black/20 rounded-full">
      <ChevronRight class="w-10 h-10" />
    </button>

    <!-- Counter -->
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/30 px-3 py-1 rounded-full text-sm">
        {{ currentLightboxIndex + 1 }} / {{ lightboxImages.length }}
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.slide-enter-active, .slide-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}
.slide-enter-from, .slide-leave-to {
    opacity: 0;
    transform: scale(0.95);
}
</style>
