<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => route.meta?.title ?? '工作台')
const description = computed(() => route.meta?.description ?? '开始构建你的业务页面。')
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
    <div>
      <p class="app-header__date">{{ today }}</p>
      <h2>{{ title }}</h2>
      <p class="app-header__description">{{ description }}</p>
    </div>

    <div class="app-header__panel">
      <div class="app-header__status">
        <span class="dot"></span>
        路由与布局已接入
      </div>
      <div class="app-header__user">
        <strong>Admin</strong>
        <span>Project Owner</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 28px 32px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.app-header__date {
  margin-bottom: 8px;
  color: rgba(201, 218, 255, 0.72);
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.app-header h2 {
  color: #f5f8ff;
  font-size: clamp(28px, 4vw, 38px);
  line-height: 1.1;
  font-weight: 700;
  text-shadow: 0 6px 18px rgba(1, 7, 18, 0.4);
}

.app-header__description {
  margin-top: 10px;
  max-width: 640px;
  color: rgba(201, 218, 255, 0.74);
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
  background: rgba(7, 14, 28, 0.6);
  border: 1px solid rgba(191, 218, 255, 0.12);
  box-shadow: 0 18px 34px rgba(2, 8, 20, 0.26);
  backdrop-filter: blur(14px);
}

.app-header__status {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #dce7fa;
  font-size: 14px;
  white-space: nowrap;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3dcf8e;
  box-shadow: 0 0 0 6px rgba(61, 207, 142, 0.15);
}

.app-header__user strong,
.app-header__user span {
  display: block;
}

.app-header__user strong {
  color: #f4f8ff;
  font-size: 15px;
  font-weight: 700;
}

.app-header__user span {
  color: rgba(201, 218, 255, 0.68);
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
