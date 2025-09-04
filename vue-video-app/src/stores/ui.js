// src/stores/ui.js
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // 图片查看器状态
  const isLightboxOpen = ref(false)
  const lightboxImages = ref([])
  const currentLightboxIndex = ref(0)

  // 新增：视频播放器弹窗状态
  const isVideoModalOpen = ref(false)
  const videoModalUrl = ref('')

  function openLightbox(images, startIndex = 0) {
    lightboxImages.value = images
    currentLightboxIndex.value = startIndex
    isLightboxOpen.value = true
  }

  function closeLightbox() {
    isLightboxOpen.value = false
  }

  function nextImage() {
    if (lightboxImages.value.length > 0) {
      currentLightboxIndex.value = (currentLightboxIndex.value + 1) % lightboxImages.value.length
    }
  }

  function prevImage() {
    if (lightboxImages.value.length > 0) {
      currentLightboxIndex.value = (currentLightboxIndex.value - 1 + lightboxImages.value.length) % lightboxImages.value.length
    }
  }

  function openVideoModal(url) {
    videoModalUrl.value = url
    isVideoModalOpen.value = true
  }

  function closeVideoModal() {
    isVideoModalOpen.value = false
    videoModalUrl.value = ''
  }

  return {
    isLightboxOpen, lightboxImages, currentLightboxIndex, openLightbox, closeLightbox, nextImage, prevImage,
    isVideoModalOpen, videoModalUrl, openVideoModal, closeVideoModal
  }
})
