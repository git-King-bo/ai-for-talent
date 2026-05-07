<script setup>
const integrationModes = [
  {
    title: '保留模板布局，只替换业务主区',
    summary: '适合后台系统、控制台、运营平台。',
    detail:
      '把你的业务页面挂到 `src/router/routes.js` 的子路由里，复用现成的左侧导航、页头和系统页。这样最省时间，也最适合快速起一个可维护桌面版本。',
  },
  {
    title: '仅保留 Electron 壳，前端完全替换',
    summary: '适合已有成熟前端仓，需要最小迁移成本。',
    detail:
      '保留 `electron/`、`electron-builder.yml`、`vite.config.js`，然后按你的页面组织方式重建 `src/`。这是把现有 Web 项目桌面化时最常见的路径。',
  },
  {
    title: '渐进式增加桌面能力',
    summary: '适合先上线，再逐步做本地化增强。',
    detail:
      '先只把页面放进来，确认打包和路由都正常；之后再新增本地文件、系统菜单、通知、窗口控制等 IPC 能力，避免一开始把复杂度堆太高。',
  },
]

const folders = [
  ['electron/main.js', '主进程入口，负责窗口、权限、IPC 和生命周期。'],
  ['electron/preload.js', '桥接层，只把经过筛选的能力暴露给渲染进程。'],
  ['src/router/routes.js', '页面接入点。替换业务路由时，优先改这里。'],
  ['src/utils/desktop.js', '渲染层调用 Electron API 的统一封装层。'],
]

const ipcChecklist = [
  '主进程只暴露必须的行为，不直接把 `fs`、`path` 透给页面。',
  '所有外链走白名单，继续复用 `shell.openExternal` 的安全出口。',
  '渲染层把 IPC 调用收敛到 `src/utils/desktop.js`，避免页面到处散落字符串 channel。',
]
</script>

<template>
  <section class="integration">
    <article class="integration-hero">
      <div>
        <span>Embedding strategy</span>
        <h3>要快，就先改入口；要稳，就把桌面能力集中在桥接层。</h3>
      </div>
      <p>
        这个模板已经把“桌面壳”和“页面层”的边界划出来了。后续嵌套别的项目时，建议尽量让业务代码只关心路由、组件和接口，把系统能力留在
        `electron/` 与 `preload`。
      </p>
    </article>

    <section class="mode-list">
      <article v-for="mode in integrationModes" :key="mode.title" class="mode-card">
        <h4>{{ mode.title }}</h4>
        <strong>{{ mode.summary }}</strong>
        <p>{{ mode.detail }}</p>
      </article>
    </section>

    <section class="integration-grid">
      <article class="folder-card">
        <span>Where to patch</span>
        <h4>后续二次开发最常改的入口</h4>
        <ul>
          <li v-for="[path, description] in folders" :key="path">
            <code>{{ path }}</code>
            <p>{{ description }}</p>
          </li>
        </ul>
      </article>

      <article class="ipc-card">
        <span>IPC guardrails</span>
        <h4>把模板继续做成生产项目时，优先守住这些边界</h4>
        <ol>
          <li v-for="item in ipcChecklist" :key="item">{{ item }}</li>
        </ol>
      </article>
    </section>
  </section>
</template>

<style scoped>
.integration {
  display: grid;
  gap: 20px;
}

.integration-hero,
.mode-card,
.folder-card,
.ipc-card {
  border-radius: 28px;
  border: 1px solid var(--color-line);
  background: var(--color-panel);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(18px);
}

.integration-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  gap: 18px;
  padding: 24px 26px;
}

.integration-hero span,
.folder-card span,
.ipc-card span {
  color: var(--color-accent-soft);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.integration-hero h3,
.mode-card h4,
.folder-card h4,
.ipc-card h4 {
  margin-top: 10px;
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 3.2rem);
  line-height: 0.98;
}

.integration-hero p {
  color: var(--color-text-soft);
  align-self: end;
}

.mode-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.mode-card {
  padding: 22px;
}

.mode-card strong {
  display: block;
  margin-top: 14px;
  color: var(--color-accent-soft);
  font-size: 15px;
}

.mode-card p {
  margin-top: 14px;
  color: var(--color-text-soft);
}

.integration-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
}

.folder-card,
.ipc-card {
  padding: 24px;
}

.folder-card ul,
.ipc-card ol {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.folder-card li,
.ipc-card li {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 244, 233, 0.04);
}

.folder-card code {
  color: #ffe3c3;
}

.folder-card p,
.ipc-card li {
  margin-top: 10px;
  color: var(--color-text-soft);
}

@media (max-width: 1100px) {
  .integration-hero,
  .mode-list,
  .integration-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .integration-hero,
  .mode-card,
  .folder-card,
  .ipc-card {
    border-radius: 24px;
  }

  .integration-hero,
  .folder-card,
  .ipc-card {
    padding: 20px;
  }
}
</style>
