// src/stores/profile.js
import { reactive, ref } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'
import router from '@/router'
import { useAuthStore } from './auth'

const PAGE_SIZE = 12;

export const useProfileStore = defineStore('profile', () => {
  const history = reactive({
    items: [],
    page: 1,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  })

  const favorites = reactive({
    items: [],
    page: 1,
    hasMore: true,
    isLoading: false,
    isLoadingMore: false,
    error: null,
  })
  const favoriteIds = ref(new Set())

  async function fetchFavoriteIds() {
    try {
      const response = await api.get('/profile/favorites/ids')
      favoriteIds.value = new Set(response.data)
    } catch (error) {
      console.error('获取收藏ID列表失败:', error)
      favoriteIds.value.clear()
    }
  }

  function isFavorited(movieId) {
    return favoriteIds.value.has(movieId)
  }

  async function toggleFavorite(movie) {
    const authStore = useAuthStore()
    // 核心修复：在执行任何操作前，检查用户是否已登录
    if (!authStore.isAuthenticated) {
      // 如果未登录，则跳转到登录页，并附带一个重定向参数
      router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
      return // 终止函数执行
    }

    const movieId = movie.id
    const currentlyFavorited = isFavorited(movieId)

    if (currentlyFavorited) {
      favoriteIds.value.delete(movieId)
    } else {
      favoriteIds.value.add(movieId)
    }

    try {
      if (currentlyFavorited) {
        await api.delete(`/profile/favorites/${movieId}`)
      } else {
        await api.post(`/profile/favorites/${movieId}`)
      }
      if (favorites.items.length > 0) {
        fetchFavorites();
      }
    } catch (error) {
      console.error('切换收藏状态失败:', error)
      if (currentlyFavorited) {
        favoriteIds.value.add(movieId)
      } else {
        favoriteIds.value.delete(movieId)
      }
    }
  }

  function clearFavorites() {
    favoriteIds.value.clear()
  }

  async function fetchHistory() {
    history.isLoading = true
    history.page = 1
    history.items = []
    history.error = null
    try {
      const response = await api.get('/profile/history', {
        params: { pageIndex: 1, pageSize: PAGE_SIZE }
      })
      const newItems = response.data.items
      history.items = newItems
      history.hasMore = newItems.length === PAGE_SIZE
    } catch (err) {
      console.error('获取观看记录失败:', err)
      history.error = '无法加载观看记录'
    } finally {
      history.isLoading = false
    }
  }

  async function loadMoreHistory() {
      if (!history.hasMore || history.isLoadingMore) return;
      history.isLoadingMore = true;
      history.page++;
      try {
          const response = await api.get('/profile/history', {
            params: { pageIndex: history.page, pageSize: PAGE_SIZE }
          })
          const newItems = response.data.items
          history.items.push(...newItems)
          history.hasMore = newItems.length === PAGE_SIZE
      } catch (err) {
          console.error('加载更多观看记录失败:', err);
          history.page--;
      } finally {
          history.isLoadingMore = false;
      }
  }

  async function fetchFavorites() {
    favorites.isLoading = true
    favorites.page = 1
    favorites.items = []
    favorites.error = null
    try {
      const response = await api.get('/profile/favorites', {
        params: { pageIndex: 1, pageSize: PAGE_SIZE }
      })
      const newItems = response.data.items
      favorites.items = newItems
      favorites.hasMore = newItems.length === PAGE_SIZE
    } catch (err) {
      console.error('获取收藏列表失败:', err)
      favorites.error = '无法加载收藏列表'
    } finally {
      favorites.isLoading = false
    }
  }

  async function loadMoreFavorites() {
      if (!favorites.hasMore || favorites.isLoadingMore) return;
      favorites.isLoadingMore = true;
      favorites.page++;
      try {
          const response = await api.get('/profile/favorites', {
            params: { pageIndex: favorites.page, pageSize: PAGE_SIZE }
          })
          const newItems = response.data.items
          favorites.items.push(...newItems)
          favorites.hasMore = newItems.length === PAGE_SIZE
      } catch (err) {
          console.error('加载更多收藏失败:', err);
          favorites.page--;
      } finally {
          favorites.isLoadingMore = false;
      }
  }

  function reset() {
      Object.assign(history, {
        items: [], page: 1, hasMore: true, isLoading: false, isLoadingMore: false, error: null,
      });
      Object.assign(favorites, {
        items: [], page: 1, hasMore: true, isLoading: false, isLoadingMore: false, error: null,
      });
  }

  return { history, favorites, favoriteIds, isFavorited, toggleFavorite, fetchFavoriteIds, clearFavorites, fetchHistory, loadMoreHistory, fetchFavorites, loadMoreFavorites, reset }
})
