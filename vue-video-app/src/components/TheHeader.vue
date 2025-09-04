<!-- src/components/TheHeader.vue -->
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Search, History, Crown, User } from 'lucide-vue-next'

const authStore = useAuthStore()
const showUserMenu = ref(false)
</script>

<template>
  <header class="bg-gray-800/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
    <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- 左侧：Logo 和桌面端导航 -->
        <div class="flex items-center space-x-8">
          <RouterLink to="/" class="flex-shrink-0 text-white text-2xl font-bold flex items-center">
            流光影院
          </RouterLink>
          <div class="hidden md:flex items-baseline space-x-6">
            <RouterLink to="/" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-400">首页</RouterLink>
            <RouterLink to="/categories" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-400">分类</RouterLink>
            <RouterLink to="/gossip" class="text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium" active-class="text-indigo-400">吃瓜中心</RouterLink>
          </div>
        </div>

        <!-- 中间：桌面端搜索栏 -->
        <div class="hidden md:flex flex-1 justify-center px-2 lg:ml-6 lg:justify-center">
            <div class="max-w-lg w-full lg:max-w-xs">
                <label for="search" class="sr-only">搜索</label>
                <div class="relative text-gray-400 focus-within:text-gray-600">
                    <div class="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Search class="h-5 w-5" />
                    </div>
                    <input
                        id="search"
                        class="block w-full bg-gray-700/50 py-2 pl-10 pr-3 border border-transparent rounded-md leading-5 text-gray-300 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-white focus:ring-white focus:text-gray-900 sm:text-sm"
                        placeholder="搜索影片"
                        type="search"
                        name="search"
                    />
                </div>
            </div>
        </div>

        <!-- 右侧：用户操作 -->
        <div class="flex items-center space-x-4">
          <!-- 移动端搜索按钮 -->
          <button class="md:hidden text-gray-300 hover:text-white">
            <Search class="h-6 w-6" />
          </button>

          <template v-if="authStore.isAuthenticated">
            <button class="hidden md:block text-gray-300 hover:text-white">
              <History class="h-6 w-6" />
            </button>
            <RouterLink to="/vip" class="hidden md:block text-yellow-400 hover:text-yellow-300">
              <Crown class="h-6 w-6" />
            </RouterLink>
            <div class="relative">
              <button @click="showUserMenu = !showUserMenu" class="text-gray-300 hover:text-white">
                <User class="h-6 w-6" />
              </button>
              <div v-if="showUserMenu" @click.away="showUserMenu = false" class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 z-10">
                <RouterLink to="/profile" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">个人中心</RouterLink>
                <a href="#" @click.prevent="authStore.logout()" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">退出登录</a>
              </div>
            </div>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-gray-300 hover:text-white text-sm font-medium">登录</RouterLink>
            <RouterLink to="/register" class="hidden md:block bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">注册</RouterLink>
            <!-- 核心修改：在移动端隐藏此按钮 -->
            <RouterLink to="/vip" class="hidden md:inline-flex items-center justify-center bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-md text-sm font-bold transition-all shadow-lg">
              开通VIP
            </RouterLink>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>
