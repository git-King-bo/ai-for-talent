<script setup>
import { onMounted, ref } from 'vue'
import { getRuntimeInfo, openExternal } from '@/utils/desktop'

const runtimeInfo = ref({
  name: 'Electron Launchpad',
  version: 'dev',
  isPackaged: false,
  platform: 'browser',
  arch: 'n/a',
  osRelease: 'n/a',
  electronVersion: 'n/a',
  chromeVersion: 'n/a',
  nodeVersion: 'n/a',
  userDataPath: 'n/a',
  logsPath: 'n/a',
  homePath: 'n/a',
})

const infoRows = ref([])

async function loadRuntimeInfo() {
  const info = await getRuntimeInfo()
  runtimeInfo.value = info
  infoRows.value = [
    ['App name', info.name],
    ['Version', info.version],
    ['Runtime mode', info.isPackaged ? 'Packaged' : 'Development'],
    ['Platform', `${info.platform} / ${info.arch}`],
    ['OS release', info.osRelease],
    ['Electron', info.electronVersion],
    ['Chrome', info.chromeVersion],
    ['Node', info.nodeVersion],
  ]
}

onMounted(() => {
  void loadRuntimeInfo()
})
</script>

<template>
  <section class="system">
    <article class="system-banner">
      <div>
        <span>Runtime inspection</span>
        <h3>用真实运行时信息确认这套壳已经具备桌面应用骨架。</h3>
      </div>
      <div class="system-banner__actions">
        <button type="button" @click="loadRuntimeInfo">刷新信息</button>
        <button type="button" class="is-ghost" @click="openExternal('https://www.electron.build/')">
          打开打包文档
        </button>
      </div>
    </article>

    <section class="system-grid">
      <article class="panel">
        <span>Runtime matrix</span>
        <h4>桌面环境信息</h4>
        <dl class="info-grid">
          <template v-for="[label, value] in infoRows" :key="label">
            <dt>{{ label }}</dt>
            <dd>{{ value }}</dd>
          </template>
        </dl>
      </article>

      <article class="panel">
        <span>App paths</span>
        <h4>生产排障时常用目录</h4>
        <div class="path-list">
          <div>
            <strong>User data</strong>
            <code>{{ runtimeInfo.userDataPath }}</code>
          </div>
          <div>
            <strong>Logs</strong>
            <code>{{ runtimeInfo.logsPath }}</code>
          </div>
          <div>
            <strong>Home</strong>
            <code>{{ runtimeInfo.homePath }}</code>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.system {
  display: grid;
  gap: 20px;
}

.system-banner,
.panel {
  border-radius: 28px;
  border: 1px solid var(--color-line);
  background: var(--color-panel);
  box-shadow: var(--shadow-panel);
  backdrop-filter: blur(18px);
}

.system-banner {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  padding: 24px 26px;
}

.system-banner span,
.panel span {
  color: var(--color-accent-soft);
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.system-banner h3,
.panel h4 {
  margin-top: 10px;
  font-family: var(--font-display);
}

.system-banner h3 {
  max-width: 14ch;
  font-size: clamp(2rem, 3vw, 3.2rem);
  line-height: 0.98;
}

.system-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.system-banner__actions button {
  padding: 12px 18px;
  border-radius: 999px;
  border: 0;
  background: linear-gradient(135deg, #f7c589, #eb7e36);
  color: #24160e;
  font-weight: 700;
  cursor: pointer;
}

.system-banner__actions .is-ghost {
  border: 1px solid var(--color-line);
  background: rgba(255, 244, 233, 0.04);
  color: var(--color-text);
}

.system-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;
}

.panel {
  padding: 24px;
}

.panel h4 {
  font-size: 32px;
  line-height: 1;
}

.info-grid {
  margin-top: 20px;
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: 14px 16px;
}

.info-grid dt {
  color: var(--color-text-muted);
}

.info-grid dd {
  color: var(--color-text);
  text-align: right;
}

.path-list {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.path-list div {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 244, 233, 0.04);
}

.path-list strong {
  display: block;
  margin-bottom: 10px;
}

.path-list code {
  color: #ffe3c3;
  word-break: break-word;
}

@media (max-width: 1100px) {
  .system-banner,
  .system-grid {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 720px) {
  .system-banner,
  .panel {
    border-radius: 24px;
    padding: 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-grid dd {
    text-align: left;
  }
}
</style>
