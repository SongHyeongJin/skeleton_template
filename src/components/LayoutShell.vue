<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const isFormRoute = computed(() => ['transaction-new', 'transaction-edit'].includes(route.name))

const navItems = [
  { to: '/', routeName: 'home', label: '홈', shortLabel: '홈' },
  { to: '/transactions', routeName: 'transactions', label: '거래내역', shortLabel: '내역' },
  { to: '/budgets', routeName: 'budgets', label: '예산', shortLabel: '예산' },
  { to: '/calendar', routeName: 'calendar', label: '달력', shortLabel: '달력' },
]
</script>

<template>
  <div class="app-shell">
    <header class="top-bar">
      <div class="top-bar__inner">
        <RouterLink to="/" class="brand" aria-label="가계부 홈">
          <span class="brand__mark">₩</span>
          <span class="brand__text">가계부</span>
        </RouterLink>

        <nav class="desktop-nav" aria-label="주요 메뉴">
          <RouterLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="nav-link"
            :class="{ 'nav-link--active': route.name === item.routeName }"
          >
            {{ item.label }}
          </RouterLink>
        </nav>
      </div>
    </header>

    <main class="app-main">
      <RouterView />
    </main>

    <RouterLink
      v-if="!isFormRoute"
      to="/transactions/new"
      class="quick-add"
      aria-label="새 거래 추가"
    >
      +
    </RouterLink>

    <nav class="mobile-nav" aria-label="모바일 주요 메뉴">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="mobile-nav__link"
        :class="{ 'mobile-nav__link--active': route.name === item.routeName }"
      >
        {{ item.shortLabel }}
      </RouterLink>
    </nav>
  </div>
</template>
