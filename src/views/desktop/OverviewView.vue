<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getAppMetadata, openExternal } from '@/utils/desktop'

const appMetadata = ref({
  name: 'Electron Launchpad',
  version: 'dev',
  isPackaged: false,
  platform: 'web',
})

const capabilityCards = [
  {
    label: 'Secure Shell',
    title: 'Renderer and Node stay separated',
    description:
      'Preload bridge 已经接好，后续新增文件系统或本地数据库能力时，不需要把 Node 权限直接暴露给页面。',
  },
  {
    label: 'Fast UI Loop',
    title: 'Vite dev server for renderer work',
    description:
      '你可以先用浏览器跑页面，再切回 Electron 验证窗口行为，开发体验会比全程冷启动桌面壳顺很多。',
  },
  {
    label: 'Packaging Ready',
    title: 'Builder config stays close to production',
    description: '已保留安装包产物配置、单实例控制和外链白名单，适合作为后续项目的稳定起点。',
  },
]

const launchSteps = [
  '替换 `src/views/desktop` 下的演示页面，先把你的业务主页面接进来。',
  '在 `src/router/routes.js` 中整理路由，决定是否保留模板布局和系统面板。',
  '需要本地能力时，在 `electron/main.js` 与 `electron/preload.js` 中新增 IPC，再由渲染层调用。',
]

const quickCommands = [
  'npm run dev',
  'npm run dev:electron',
  'npm run preview:electron',
  'npm run dist:electron',
]

const environmentLine = computed(() => {
  const mode = appMetadata.value.isPackaged ? 'packaged build' : 'development build'
  return `${appMetadata.value.name} ${appMetadata.value.version} running as ${mode}`
})

onMounted(async () => {
  appMetadata.value = await getAppMetadata()
})
</script>

<template>
  <section class="overview">
    <article class="hero-panel">
      <div class="hero-panel__content">
        <p class="hero-panel__eyebrow">Production-grade Electron starter</p>
        <h3>把这个仓库当成你的桌面应用母板，而不是一次性演示。</h3>
        <p class="hero-panel__description">
          当前保留的是桌面壳真正值得复用的部分：安全
          preload、打包链路、运行时信息面板、通用布局和开发入口。你后续只需要替换页面与
          IPC，就能快速进入业务开发。
        </p>

        <div class="hero-panel__actions">
          <RouterLink class="hero-panel__primary" to="/integration">查看集成位</RouterLink>
          <button
            class="hero-panel__ghost"
            type="button"
            @click="openExternal('https://www.electronjs.org/docs/latest')"
          >
            打开 Electron 文档
          </button>
        </div>
      </div>

      <div class="hero-panel__meta">
        <div class="stat-card">
          <span class="stat-card__label">Runtime</span>
          <strong>{{ appMetadata.platform }}</strong>
          <small>{{ environmentLine }}</small>
        </div>
        <div class="stat-card">
          <span class="stat-card__label">Window stack</span>
          <strong>Single instance</strong>
          <small>主窗口、白名单导航、打包入口已接入</small>
        </div>
      </div>
    </article>

    <section class="capability-grid">
      <article v-for="card in capabilityCards" :key="card.title" class="capability-card">
        <span>{{ card.label }}</span>
        <h4>{{ card.title }}</h4>
        <p>{{ card.description }}</p>
      </article>
    </section>

    <section class="overview-grid">
      <article class="checklist-card">
        <div class="section-heading">
          <span>Launch checklist</span>
          <h4>开始改造前，优先看这三步</h4>
        </div>

        <ol class="checklist">
          <li v-for="step in launchSteps" :key="step">{{ step }}</li>
        </ol>
      </article>

      <article class="command-card">
        <div class="section-heading">
          <span>Command deck</span>
          <h4>最常用的桌面开发命令</h4>
        </div>

        <div class="command-list">
          <code v-for="command in quickCommands" :key="command">{{ command }}</code>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.overview {
  display: grid;
  gap: 22px;
}

.hero-panel,
.capability-card,
.checklist-card,
.command-card,
.stat-card {
  border: 1px solid var(--color-line);
  background: var(--color-panel);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(18px);
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.9fr);
  gap: 18px;
  padding: 28px;
  border-radius: 30px;
}

.hero-panel__eyebrow,
.section-heading span,
.capability-card span,
.stat-card__label {
  color: var(--color-accent-soft);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-panel h3,
.section-heading h4,
.capability-card h4 {
  font-family: var(--font-display);
  font-weight: 700;
}

.hero-panel h3 {
  margin-top: 10px;
  max-width: 12ch;
  font-size: clamp(2.3rem, 4vw, 4rem);
  line-height: 0.96;
}

.hero-panel__description {
  max-width: 56rem;
  margin-top: 18px;
  color: var(--color-text-soft);
  font-size: 15px;
}

.hero-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.hero-panel__primary,
.hero-panel__ghost {
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.hero-panel__primary {
  background: linear-gradient(135deg, #f7c589, #eb7e36);
  color: #24160e;
}

.hero-panel__ghost {
  border: 1px solid var(--color-line);
  background: rgba(255, 244, 233, 0.04);
  color: var(--color-text);
}

.hero-panel__primary:hover,
.hero-panel__ghost:hover {
  transform: translateY(-1px);
}

.hero-panel__meta {
  display: grid;
  gap: 14px;
}

.stat-card {
  min-height: 150px;
  padding: 20px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top right, rgba(124, 146, 255, 0.16), transparent 34%),
    var(--color-panel-strong);
}

.stat-card strong {
  display: block;
  margin-top: 16px;
  font-size: 24px;
  color: var(--color-text);
}

.stat-card small {
  display: block;
  margin-top: 10px;
  color: var(--color-text-soft);
  line-height: 1.6;
}

.capability-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.capability-card {
  min-height: 220px;
  padding: 22px;
  border-radius: 26px;
}

.capability-card h4 {
  margin-top: 18px;
  font-size: 28px;
  line-height: 1;
}

.capability-card p {
  margin-top: 16px;
  color: var(--color-text-soft);
}

.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 18px;
}

.checklist-card,
.command-card {
  padding: 24px;
  border-radius: 28px;
}

.section-heading h4 {
  margin-top: 10px;
  font-size: 32px;
  line-height: 1;
}

.checklist {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.checklist li {
  position: relative;
  padding: 16px 18px 16px 52px;
  border-radius: 20px;
  background: rgba(255, 244, 233, 0.04);
  color: var(--color-text-soft);
}

.checklist li::before {
  content: counter(list-item, decimal-leading-zero);
  position: absolute;
  left: 18px;
  top: 16px;
  color: var(--color-accent);
  font-weight: 700;
}

.command-list {
  margin-top: 20px;
  display: grid;
  gap: 12px;
}

.command-list code {
  display: block;
  padding: 16px 18px;
  border-radius: 18px;
  background: #110f0e;
  border: 1px solid rgba(255, 244, 233, 0.06);
  color: #ffe3c3;
  font-size: 14px;
}

@media (max-width: 1100px) {
  .hero-panel,
  .overview-grid,
  .capability-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .hero-panel,
  .capability-card,
  .checklist-card,
  .command-card {
    border-radius: 24px;
  }

  .hero-panel,
  .checklist-card,
  .command-card {
    padding: 20px;
  }

  .hero-panel h3,
  .section-heading h4,
  .capability-card h4 {
    max-width: none;
  }
}
</style>
