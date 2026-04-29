<script setup>
import { computed } from 'vue'
import { shellConfig } from '@/config/shell'

const checklist = [
  '在 shell.config.json 里修改 productName、identifier 和窗口文案',
  '把 src/apps/starter 复制成你的业务模块目录',
  '在 src/apps/index.js 里注册你的应用模块',
  '把 VITE_SHELL_APP_ID 切到你的模块 id',
  '按需替换 ShellBackground 或设置为 none',
]

const envPreview = computed(() => [
  `VITE_APP_NAME=${shellConfig.appName}`,
  `VITE_SHELL_APP_ID=${shellConfig.activeAppId}`,
  `VITE_SHELL_BACKGROUND=${shellConfig.background}`,
])
</script>

<template>
  <main class="starter-shell">
    <section class="starter-panel">
      <span class="starter-kicker">Reusable Tauri Shell</span>
      <h1>{{ shellConfig.appName }}</h1>
      <p>
        当前已经进入一个可直接替换的示例业务模块。你可以保留这页作为空壳首页，或者把它替换成自己的
        Vue 页面与路由。
      </p>

      <div class="starter-grid">
        <article class="starter-card">
          <h2>接入步骤</h2>
          <ul>
            <li v-for="item in checklist" :key="item">{{ item }}</li>
          </ul>
        </article>

        <article class="starter-card starter-card--accent">
          <h2>当前壳配置</h2>
          <code v-for="item in envPreview" :key="item">{{ item }}</code>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.starter-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: clamp(24px, 5vw, 48px);
}

.starter-panel {
  width: min(960px, 100%);
  padding: clamp(28px, 5vw, 52px);
  border-radius: 32px;
  border: 1px solid rgba(146, 174, 225, 0.16);
  background: linear-gradient(180deg, rgba(9, 17, 31, 0.86), rgba(6, 12, 22, 0.92));
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
  color: #edf3ff;
  backdrop-filter: blur(18px);
}

.starter-kicker {
  display: inline-flex;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(86, 132, 255, 0.16);
  color: #95bcff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.starter-panel h1 {
  margin: 18px 0 10px;
  font-size: clamp(36px, 5vw, 56px);
  line-height: 0.94;
  letter-spacing: -0.04em;
}

.starter-panel p {
  max-width: 720px;
  color: rgba(224, 234, 255, 0.78);
  font-size: 15px;
  line-height: 1.8;
}

.starter-grid {
  display: grid;
  gap: 18px;
  margin-top: 28px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.starter-card {
  display: grid;
  gap: 14px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(146, 174, 225, 0.12);
}

.starter-card--accent {
  background: linear-gradient(180deg, rgba(57, 101, 215, 0.18), rgba(17, 32, 60, 0.38));
}

.starter-card h2 {
  margin: 0;
  font-size: 18px;
}

.starter-card ul {
  margin: 0;
  padding-left: 20px;
  color: rgba(237, 243, 255, 0.86);
  line-height: 1.8;
}

.starter-card code {
  display: block;
  padding: 12px 14px;
  border-radius: 16px;
  background: rgba(5, 10, 18, 0.68);
  color: #b6d3ff;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 800px) {
  .starter-grid {
    grid-template-columns: 1fr;
  }
}
</style>
