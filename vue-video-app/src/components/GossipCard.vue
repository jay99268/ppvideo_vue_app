<!-- src/components/GossipCard.vue -->
<script setup>
import { computed } from 'vue';
import { useUiStore } from '@/stores/ui';
import { PlayCircle } from 'lucide-vue-next';

const props = defineProps({
  post: {
    type: Object,
    required: true
  }
})

const uiStore = useUiStore();

const images = computed(() => props.post.media.filter(m => m.mediaType === 'image'));

function openImage(clickedMedia) {
  const imageIndex = images.value.findIndex(img => img.mediaUrl === clickedMedia.mediaUrl);
  if (imageIndex !== -1) {
    uiStore.openLightbox(images.value, imageIndex);
  }
}

function openVideo(media) {
  uiStore.openVideoModal(media.mediaUrl);
}

function getThumbnailUrl(videoUrl) {
  try {
    const match = videoUrl.match(/cloudflarestream\.com\/([a-f0-9]+)\/iframe/);
    if (match && match[1]) {
      const videoUid = match[1];
      return videoUrl.substring(0, videoUrl.indexOf(videoUid)) + videoUid + '/thumbnails/thumbnail.jpg';
    }
  } catch (e) {
    console.error("无法为视频URL生成预览图:", videoUrl, e);
  }
  return '';
}

const formattedDate = computed(() => {
  if (!props.post.createdAt) return '';
  const date = new Date(props.post.createdAt);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
})

const gridClass = computed(() => {
    const count = props.post.media.length;
    if (count === 1) return 'grid-cols-1 grid-rows-1';
    if (count === 2 || count === 4) return 'grid-cols-2 grid-rows-2';
    return 'grid-cols-2 grid-rows-2';
});
</script>

<template>
  <div class="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
    <!-- Media Grid -->
    <div v-if="post.media && post.media.length > 0" class="grid gap-0.5" :class="gridClass">
      <div
        v-for="(media) in post.media.slice(0, 4)"
        :key="media.mediaUrl"
        :class="{
          'col-span-2 row-span-2': post.media.length === 1,
          'row-span-2': post.media.length === 2,
          'col-span-2': post.media.length === 3 && post.media.indexOf(media) === 0,
        }"
        class="relative aspect-square bg-black group"
      >
        <button v-if="media.mediaType === 'image'" @click="openImage(media)" class="w-full h-full">
          <img :src="media.mediaUrl" class="w-full h-full object-cover" />
        </button>

        <button v-if="media.mediaType === 'video'" @click="openVideo(media)" class="w-full h-full relative">
          <img :src="getThumbnailUrl(media.mediaUrl)" class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-black/30 flex items-center justify-center">
            <PlayCircle class="w-16 h-16 text-white/70 group-hover:text-white transition-colors" />
          </div>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-4">
      <p class="text-white whitespace-pre-wrap">{{ post.content }}</p>
      <div class="text-right text-xs text-gray-400 mt-2">
        <span>{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>
