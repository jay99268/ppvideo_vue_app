<!-- src/components/VideoModal.vue -->
<script setup>
import { useUiStore } from '@/stores/ui'
import { X } from 'lucide-vue-next'

const uiStore = useUiStore()
</script>

<template>
  <div
    @click.self="uiStore.closeVideoModal"
    class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
  >
    <div class="relative w-full max-w-4xl aspect-video">
      <iframe
        :src="uiStore.videoModalUrl"
        class="w-full h-full rounded-lg"
        style="border: none;"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowfullscreen="true"
      ></iframe>
    </div>
    <button @click="uiStore.closeVideoModal" class="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
      <X class="w-8 h-8" />
    </button>
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
</style>
