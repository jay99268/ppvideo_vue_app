// src/stores/movies.js
import { ref, reactive, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/api'

const HOME_PAGE_SIZE = 6;
const CATEGORY_PAGE_SIZE = 18;

export const useMovieStore = defineStore('movies', () => {
  // --- 首页状态 ---
  const banners = ref([])
  const homeIsLoading = ref(false)
  const homeError = ref(null)
  const sections = reactive({
    latest: { title: '最新上映', items: [], page: 1, hasMore: true, isLoadingMore: false, params: { sortBy: 'published_at' } },
    popular: { title: '热门精选', items: [], page: 1, hasMore: true, isLoadingMore: false, params: { sortBy: 'release_year' } },
    vip: { title: '会员专享', items: [], page: 1, hasMore: true, isLoadingMore: false, params: { monetizationType: 'vip' } },
    free: { title: '免费专区', items: [], page: 1, hasMore: true, isLoadingMore: false, params: { monetizationType: 'free' } }
  })

  // --- 分类页状态 ---
  const categories = ref([])
  const tags = ref([])
  const filteredMovies = ref([])
  const categoryPage = ref(1)
  const categoryHasMore = ref(true)
  const categoryIsLoading = ref(false)
  const categoryIsLoadingMore = ref(false)
  const categoryError = ref(null)
  const activeFilters = reactive({
      genre: '全部',
      region: '全部',
      tag: '全部',
      sortBy: 'published_at',
      monetizationType: null
  })

  // --- 播放页状态 ---
  const playerIsLoading = ref(false)
  const playerError = ref(null)
  const currentMovieDetail = ref(null)
  const playData = ref(null)
  const relatedMovies = ref([])

  // --- Computed 分类数据 ---
  const genres = computed(() => ['全部', ...categories.value.filter(c => c.type === 'genre').map(c => c.name)])
  const regions = computed(() => ['全部', ...categories.value.filter(c => c.type === 'region').map(c => c.name)])
  const tagList = computed(() => ['全部', ...tags.value.map(t => t.name)])

  // --- Actions ---

  async function fetchHomePageData() {
    homeIsLoading.value = true
    homeError.value = null
    try {
      const bannerPromise = api.get('/banners');
      const sectionPromises = Object.keys(sections).map(key => {
        sections[key].page = 1;
        return api.get('/movies', { params: { ...sections[key].params, pageSize: HOME_PAGE_SIZE, pageIndex: 1 } });
      });

      const [bannersRes, ...sectionResults] = await Promise.all([bannerPromise, ...sectionPromises]);

      banners.value = bannersRes.data;

      Object.keys(sections).forEach((key, index) => {
        const data = sectionResults[index].data;
        sections[key].items = data.items;
        sections[key].hasMore = data.items.length === HOME_PAGE_SIZE;
      });

    } catch (err) {
      console.error('获取首页数据失败:', err)
      homeError.value = '无法加载内容，请检查您的网络连接或稍后重试。'
    } finally {
      homeIsLoading.value = false
    }
  }

  async function loadMoreMovies(sectionKey) {
    const section = sections[sectionKey];
    if (!section || !section.hasMore || section.isLoadingMore) return;

    section.isLoadingMore = true;
    try {
      section.page++;
      const response = await api.get('/movies', { params: { ...section.params, pageSize: HOME_PAGE_SIZE, pageIndex: section.page } });
      const newItems = response.data.items;
      section.items.push(...newItems);
      if (newItems.length < HOME_PAGE_SIZE) {
        section.hasMore = false;
      }
    } catch (error) {
      console.error(`加载更多 "${section.title}" 失败:`, error);
      section.page--;
    } finally {
      section.isLoadingMore = false;
    }
  }

  async function fetchCategoriesAndTags() {
    if (categories.value.length > 0 && tags.value.length > 0) return;
    try {
      const [catRes, tagRes] = await Promise.all([api.get('/categories'), api.get('/tags')]);
      categories.value = catRes.data;
      tags.value = tagRes.data;
    } catch (err) {
      console.error('获取分类和标签失败:', err);
      categoryError.value = '无法加载筛选选项。';
    }
  }

  function getActiveFilterParams() {
    const params = {
      sortBy: activeFilters.sortBy,
      genre: activeFilters.genre === '全部' ? null : activeFilters.genre,
      region: activeFilters.region === '全部' ? null : activeFilters.region,
      tag: activeFilters.tag === '全部' ? null : activeFilters.tag,
      monetizationType: activeFilters.monetizationType,
    };
    Object.keys(params).forEach(key => (params[key] == null) && delete params[key]);
    return params;
  }

  async function fetchMoviesByFilter() {
    categoryIsLoading.value = true;
    categoryError.value = null;
    categoryPage.value = 1;

    try {
      const params = { ...getActiveFilterParams(), pageIndex: 1, pageSize: CATEGORY_PAGE_SIZE };
      const response = await api.get('/movies', { params });
      filteredMovies.value = response.data.items;
      categoryHasMore.value = response.data.items.length === CATEGORY_PAGE_SIZE;
    } catch (err) {
      console.error('按筛选获取电影失败:', err);
      categoryError.value = '无法加载影片列表，请稍后重试。';
    } finally {
      categoryIsLoading.value = false;
    }
  }

  async function loadMoreFilteredMovies() {
    if (!categoryHasMore.value || categoryIsLoadingMore.value) return;

    categoryIsLoadingMore.value = true;
    categoryPage.value++;
    try {
        const params = { ...getActiveFilterParams(), pageIndex: categoryPage.value, pageSize: CATEGORY_PAGE_SIZE };
        const response = await api.get('/movies', { params });
        const newItems = response.data.items;
        filteredMovies.value.push(...newItems);
        if (newItems.length < CATEGORY_PAGE_SIZE) {
            categoryHasMore.value = false;
        }
    } catch (err) {
        console.error('加载更多分类影片失败:', err);
        categoryPage.value--;
    } finally {
        categoryIsLoadingMore.value = false;
    }
  }

  function setFilter(type, value) {
    if (activeFilters[type] !== value) {
      activeFilters[type] = value;
      fetchMoviesByFilter();
    }
  }

  function setMonetizationTypeAndFetch(type) {
      activeFilters.monetizationType = type;
      activeFilters.genre = '全部';
      activeFilters.region = '全部';
      activeFilters.tag = '全部';
      activeFilters.sortBy = 'published_at';
      fetchMoviesByFilter();
  }

  async function fetchMovieForPlayback(id) {
    playerIsLoading.value = true;
    playerError.value = null;
    currentMovieDetail.value = null;
    playData.value = null;
    relatedMovies.value = [];
    try {
      const [detailRes, playDataRes, relatedRes] = await Promise.all([
        api.get(`/movies/${id}`),
        api.get(`/movies/${id}/play`),
        api.get(`/movies/${id}/related`)
      ]);
      currentMovieDetail.value = detailRes.data;
      playData.value = playDataRes.data;
      relatedMovies.value = relatedRes.data;
    } catch (err) {
      console.error('获取播放数据失败:', err);
      playerError.value = err.response?.data || '无法加载视频，请稍后重试。';
    } finally {
      playerIsLoading.value = false;
    }
  }

  return {
    banners, sections, homeIsLoading, homeError, fetchHomePageData, loadMoreMovies,
    genres, regions, tagList, filteredMovies, categoryIsLoading, categoryIsLoadingMore, categoryHasMore, categoryError, activeFilters,
    fetchCategoriesAndTags, fetchMoviesByFilter, loadMoreFilteredMovies, setFilter,
    setMonetizationTypeAndFetch,
    playerIsLoading, playerError, currentMovieDetail, playData, relatedMovies,
    fetchMovieForPlayback // 修复：确保函数已导出
  }
})
