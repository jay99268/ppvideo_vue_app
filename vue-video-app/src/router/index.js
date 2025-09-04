// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/categories',
      name: 'categories',
      component: () => import('../views/CategoriesView.vue')
    },
    {
      path: '/vip-zone',
      name: 'vip-zone',
      component: () => import('../views/CategoriesView.vue'),
      props: { monetizationType: 'vip' }
    },
    {
      path: '/free-zone',
      name: 'free-zone',
      component: () => import('../views/CategoriesView.vue'),
      props: { monetizationType: 'free' }
    },
    { path: '/vip', name: 'vip', component: () => import('../views/VipView.vue') },
    // 默认播放路由，现在使用 URL 播放器
    { path: '/play/:id', name: 'play', component: () => import('../views/PlayerView_url.vue') },
    // HLS 播放器路由，暂时保留但路径已更改
    { path: '/play-hls/:id', name: 'play-hls', component: () => import('../views/PlayerView.vue') },
    { path: '/gossip', name: 'gossip', component: () => import('../views/GossipView.vue'), meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
    { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } }
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
