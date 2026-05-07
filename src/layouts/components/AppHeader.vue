<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { getRuntimeBadge } from '@/utils/desktop'

const route = useRoute()

const title = computed(() => route.meta?.title ?? '工作台')
const description = computed(() => route.meta?.description ?? '开始构建你的业务页面。')
const runtimeBadge = getRuntimeBadge()
const today = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date()),
)
</script>

<template>
  <header class="app-header">
    <div class="app-header__copy">
      <div class="app-header__meta-row">
        <p class="app-header__date">{{ today }}</p>
        <span class="app-header__runtime">{{ runtimeBadge }}</span>
      </div>
      <h2>{{ title }}</h2>
      <p class="app-header__description">{{ description }}</p>
    </div>

    <div class="app-header__panel">
      <div class="app-header__status">
        <span class="dot"></span>
        Electron shell online
      </div>
      <div class="app-header__user">
        <strong>Launchpad</strong>
        <span>Ready for your app</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 30px 32px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.app-header__copy {
  min-width: 0;
}

.app-header__meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.app-header__date {
  color: var(--color-text-muted);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-header__runtime {
  padding: 6px 10px;
  border-radius: 999px;
  border: 1px solid rgba(245, 191, 123, 0.2);
  background: rgba(245, 191, 123, 0.08);
  color: var(--color-accent-soft);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.app-header h2 {
  color: var(--color-text);
  font-family: var(--font-display);
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.app-header__description {
  margin-top: 10px;
  max-width: 640px;
  color: var(--color-text-soft);
}

.app-header__panel {
  display: flex;
  align-items: center;
  gap: 14px;
}

.app-header__status,
.app-header__user {
  padding: 14px 16px;
  border-radius: 18px;
  background: var(--color-panel-muted);
  border: 1px solid var(--color-line);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(14px);
}

.app-header__status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text);
  font-size: 14px;
  white-space: nowrap;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent);
  box-shadow: 0 0 0 6px rgba(235, 126, 54, 0.14);
}

.app-header__user strong,
.app-header__user span {
  display: block;
}

.app-header__user strong {
  color: var(--color-text);
  font-size: 15px;
  font-weight: 700;
}

.app-header__user span {
  color: var(--color-text-muted);
  font-size: 13px;
}

@media (max-width: 960px) {
  .app-header {
    padding: 24px 16px 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .app-header__panel {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
