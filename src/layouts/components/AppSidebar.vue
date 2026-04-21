<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { layoutChildrenRoutes } from '@/router/routes'

const route = useRoute()

const menus = computed(() =>
  [...layoutChildrenRoutes]
    .sort((left, right) => (left.meta?.order ?? 0) - (right.meta?.order ?? 0))
    .map((item) => ({
      name: item.name,
      title: item.meta?.title ?? '',
      description: item.meta?.description ?? '',
      icon: item.meta?.icon ?? '',
      path: `/${item.path}`,
    })),
)

const isActive = (path) => route.path === path
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar__brand">
      <div class="sidebar__logo">AI</div>
      <div>
        <p class="sidebar__eyebrow">Vue3 Admin Scaffold</p>
        <h1>Talent Console</h1>
      </div>
    </div>

    <nav class="sidebar__nav">
      <RouterLink
        v-for="item in menus"
        :key="item.name"
        :to="item.path"
        class="sidebar__link"
        :class="{ 'is-active': isActive(item.path) }"
      >
        <span class="sidebar__badge">{{ item.icon }}</span>
        <span class="sidebar__meta">
          <strong>{{ item.title }}</strong>
          <small>{{ item.description }}</small>
        </span>
      </RouterLink>
    </nav>

    <div class="sidebar__footer">
      <span>基础模块</span>
      <strong>Layout / Router / API</strong>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 280px;
  padding: 28px 22px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-right: 1px solid rgba(33, 39, 55, 0.08);
  background: rgba(20, 23, 31, 0.9);
  color: #f7f1e8;
  backdrop-filter: blur(18px);
}

.sidebar__brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.sidebar__logo {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #ffb165 0%, #f46b45 100%);
  color: #20150d;
  font-size: 20px;
  font-weight: 700;
  box-shadow: 0 18px 36px rgba(244, 107, 69, 0.25);
}

.sidebar__eyebrow {
  margin-bottom: 4px;
  color: rgba(247, 241, 232, 0.62);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.sidebar__brand h1 {
  font-size: 24px;
  font-weight: 700;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar__link {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  border-radius: 18px;
  color: inherit;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
  border: 1px solid transparent;
}

.sidebar__link:hover {
  transform: translateX(4px);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

.sidebar__link.is-active {
  background: linear-gradient(135deg, rgba(255, 177, 101, 0.18), rgba(244, 107, 69, 0.08));
  border-color: rgba(255, 177, 101, 0.24);
}

.sidebar__badge {
  width: 36px;
  height: 36px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.sidebar__meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebar__meta strong {
  font-size: 15px;
  font-weight: 600;
}

.sidebar__meta small {
  color: rgba(247, 241, 232, 0.62);
  line-height: 1.5;
}

.sidebar__footer {
  margin-top: auto;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.sidebar__footer span {
  display: block;
  margin-bottom: 6px;
  color: rgba(247, 241, 232, 0.62);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.sidebar__footer strong {
  font-size: 15px;
  font-weight: 600;
}

@media (max-width: 960px) {
  .sidebar {
    width: 100%;
    padding: 20px 16px;
    border-right: 0;
    border-bottom: 1px solid rgba(33, 39, 55, 0.08);
  }

  .sidebar__nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 6px;
  }

  .sidebar__link {
    min-width: 220px;
  }

  .sidebar__footer {
    display: none;
  }
}
</style>
