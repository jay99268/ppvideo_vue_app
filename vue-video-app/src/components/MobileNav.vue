<!-- src/components/MobileNav.vue -->
<script setup>
import { RouterLink } from 'vue-router'
import { Home, LayoutGrid, Gift, Crown, User, Flame } from 'lucide-vue-next'

const navItems = [
  { name: '首页', to: '/', icon: Home },
  { name: '分类', to: '/categories', icon: LayoutGrid },
  { name: '会员区', to: '/vip-zone', icon: Crown }, // 修复：将 to 从 /vip 改为 /vip-zone
  { name: '吃瓜区', to: '/gossip', icon: Flame },
  { name: '免费区', to: '/free-zone', icon: Gift },
  { name: '我的', to: '/profile', icon: User }
]
</script>

<template>
  <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur-sm border-t border-gray-700 z-50">
    <div class="flex justify-around">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="flex flex-col items-center justify-center text-gray-400 hover:text-white w-full pt-2 pb-1"
        active-class="!text-indigo-400"
      >
        <component :is="item.icon" class="w-6 h-6 mb-1" />
        <span class="text-xs">{{ item.name }}</span>
      </RouterLink>
    </div>
  </nav>
</template>
