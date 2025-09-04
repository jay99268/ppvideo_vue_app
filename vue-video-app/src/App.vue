<!-- src/App.vue -->
<script setup>
import { RouterView } from 'vue-router'
import TheHeader from '@/components/TheHeader.vue'
import TheFooter from '@/components/TheFooter.vue'
import MobileNav from '@/components/MobileNav.vue'
import ImageLightbox from '@/components/ImageLightbox.vue'
import VideoModal from '@/components/VideoModal.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-900 text-gray-300">
    <TheHeader />
    <main class="flex-grow container mx-auto px-4 py-8 pb-24 md:pb-8">
      <RouterView />
    </main>
    <TheFooter />
    <MobileNav />

    <ImageLightbox v-if="uiStore.isLightboxOpen" />
    <VideoModal v-if="uiStore.isVideoModalOpen" />
  </div>
</template>
