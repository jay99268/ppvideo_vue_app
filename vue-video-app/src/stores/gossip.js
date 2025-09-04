// src/stores/gossip.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'

export const useGossipStore = defineStore('gossip', () => {
  const posts = ref([])
  const lastSeenId = ref(null)
  const isLoading = ref(false)
  const isLoadingHistory = ref(false)
  const isLoadingNew = ref(false)
  const error = ref(null)
  const hasMoreHistory = ref(true)
  const hasMoreNew = ref(false)

  async function fetchInitialPosts() {
    isLoading.value = true
    error.value = null
    try {
      const response = await api.get('/gossip/posts')
      posts.value = response.data.items
      lastSeenId.value = response.data.lastSeenId
      hasMoreHistory.value = response.data.hasMoreHistory
      hasMoreNew.value = response.data.hasMoreNew
    } catch (err) {
      console.error('获取吃瓜中心数据失败:', err)
      error.value = err.response?.data || '无法加载内容，请先开通VIP。'
    } finally {
      isLoading.value = false
    }
  }

  async function loadHistory() {
    if (!hasMoreHistory.value || isLoadingHistory.value) return;

    isLoadingHistory.value = true;
    const oldestId = posts.value.length > 0 ? posts.value[0].id : null;
    if (!oldestId) {
        isLoadingHistory.value = false;
        return;
    }

    try {
      const response = await api.get('/gossip/posts', { params: { before_id: oldestId } });
      const historyPosts = response.data.items;
      posts.value = [...historyPosts, ...posts.value]; // 将历史消息加到数组开头
      hasMoreHistory.value = response.data.hasMoreHistory;
    } catch (err) {
      console.error('加载历史消息失败:', err);
    } finally {
      isLoadingHistory.value = false;
    }
  }

  async function loadNew() {
    if (!hasMoreNew.value || isLoadingNew.value) return;

    isLoadingNew.value = true;
    const newestId = posts.value.length > 0 ? posts.value[posts.value.length - 1].id : null;
    if (!newestId) {
        isLoadingNew.value = false;
        return;
    }

    try {
      const response = await api.get('/gossip/posts', { params: { after_id: newestId } });
      const newPosts = response.data.items;
      posts.value = [...posts.value, ...newPosts]; // 将新消息加到数组末尾
      hasMoreNew.value = response.data.hasMoreNew;
    } catch (err) {
      console.error('加载最新消息失败:', err);
    } finally {
      isLoadingNew.value = false;
    }
  }

  async function updateProgress(postId) {
    try {
      await api.post('/gossip/progress', { lastPostId: postId });
    } catch (err) {
      console.error('更新浏览进度失败:', err);
    }
  }

  function reset() {
    posts.value = []
    lastSeenId.value = null
    isLoading.value = false
    isLoadingHistory.value = false
    isLoadingNew.value = false
    error.value = null
    hasMoreHistory.value = true
    hasMoreNew.value = false
  }

  return { posts, lastSeenId, isLoading, isLoadingHistory, isLoadingNew, error, hasMoreHistory, hasMoreNew, fetchInitialPosts, loadHistory, loadNew, updateProgress, reset }
})
