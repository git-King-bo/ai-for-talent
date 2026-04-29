import fs from 'node:fs'
import path from 'node:path'

const [, , appIdArg, ...nameArgs] = process.argv

if (!appIdArg || nameArgs.length === 0) {
  console.error('Usage: node scripts/scaffold-shell-app.mjs <app-id> <Display Name>')
  process.exit(1)
}

const rootDir = process.cwd()
const appsDir = path.join(rootDir, 'src', 'apps')
const manifestPath = path.join(appsDir, 'manifest.js')
const appId = appIdArg.trim()
const displayName = nameArgs.join(' ').trim()

if (!/^[a-z0-9-]+$/.test(appId)) {
  console.error('The app id must contain only lowercase letters, numbers, and hyphens.')
  process.exit(1)
}

if (!displayName) {
  console.error('Display name cannot be empty.')
  process.exit(1)
}

const appDir = path.join(appsDir, appId)

if (fs.existsSync(appDir)) {
  console.error(`App module already exists: ${path.relative(rootDir, appDir)}`)
  process.exit(1)
}

if (!fs.existsSync(manifestPath)) {
  console.error(`Missing app manifest: ${path.relative(rootDir, manifestPath)}`)
  process.exit(1)
}

function toPascalCase(value) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('')
}

const componentBaseName = `${toPascalCase(appId)}Home`
const routeNameBase = `${toPascalCase(appId)}Home`
const description = `Starter module for ${displayName}.`

fs.mkdirSync(appDir, { recursive: true })

fs.writeFileSync(
  path.join(appDir, `${componentBaseName}.vue`),
  `<script setup>
import { computed } from 'vue'
import { shellConfig } from '@/config/shell'

const facts = computed(() => [
  ['App Id', '${appId}'],
  ['Display Name', '${displayName}'],
  ['Shell App Id', shellConfig.activeAppId],
])
</script>

<template>
  <main class="module-shell">
    <section class="module-card">
      <span class="module-kicker">Starter Module</span>
      <h1>${displayName}</h1>
      <p>这个页面由脚手架自动生成。把它替换成你的真实业务首页即可。</p>

      <div class="module-grid">
        <article v-for="[label, value] in facts" :key="label" class="module-item">
          <span>{{ label }}</span>
          <strong>{{ value }}</strong>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.module-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}

.module-card {
  width: min(780px, 100%);
  padding: 36px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(9, 18, 33, 0.88), rgba(5, 12, 24, 0.92));
  border: 1px solid rgba(146, 174, 225, 0.16);
  box-shadow: 0 28px 80px rgba(0, 0, 0, 0.26);
  color: #eef4ff;
}

.module-kicker {
  display: inline-flex;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(86, 132, 255, 0.16);
  color: #95bcff;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.module-card h1 {
  margin: 18px 0 10px;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 0.96;
  letter-spacing: -0.04em;
}

.module-card p {
  margin: 0;
  color: rgba(224, 234, 255, 0.78);
  line-height: 1.8;
}

.module-grid {
  display: grid;
  gap: 16px;
  margin-top: 28px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.module-item {
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(146, 174, 225, 0.12);
}

.module-item span {
  color: rgba(224, 234, 255, 0.64);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.module-item strong {
  font-size: 16px;
}

@media (max-width: 720px) {
  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
`,
)

fs.writeFileSync(
  path.join(appDir, 'routes.js'),
  `export const ${toPascalCase(appId)}RouteNames = {
  home: '${routeNameBase}',
}

export function create${toPascalCase(appId)}Routes() {
  return [
    {
      path: '/',
      name: ${toPascalCase(appId)}RouteNames.home,
      component: () => import('./${componentBaseName}.vue'),
      meta: {
        title: '${displayName}',
      },
    },
  ]
}
`,
)

fs.writeFileSync(
  path.join(appDir, 'index.js'),
  `import { create${toPascalCase(appId)}Routes, ${toPascalCase(appId)}RouteNames } from './routes'

export const ${toPascalCase(appId)}App = {
  id: '${appId}',
  name: '${displayName}',
  description: '${description}',
  defaultRouteName: ${toPascalCase(appId)}RouteNames.home,
  routeNames: ${toPascalCase(appId)}RouteNames,
  createRoutes: create${toPascalCase(appId)}Routes,
}
`,
)

const manifestSource = fs.readFileSync(manifestPath, 'utf8')
const importLine = `import { ${toPascalCase(appId)}App } from './${appId}'`
const marker = 'export const registeredApps = ['

if (manifestSource.includes(importLine)) {
  console.error(`Manifest already contains import for app id "${appId}".`)
  process.exit(1)
}

if (!manifestSource.includes(marker)) {
  console.error('Unable to update src/apps/manifest.js automatically.')
  process.exit(1)
}

const updatedManifest = manifestSource
  .replace(
    "import { starterApp } from './starter'\n",
    `import { starterApp } from './starter'\n${importLine}\n`,
  )
  .replace(marker, `${marker}\n  ${toPascalCase(appId)}App,`)

fs.writeFileSync(manifestPath, updatedManifest)

console.log(`Created app module ${appId} at ${path.relative(rootDir, appDir)}`)
console.log(`Next steps:`)
console.log(`1. Set VITE_SHELL_APP_ID=${appId}`)
console.log(`2. Update shell.config.json app.activeAppId to "${appId}"`)
console.log(`3. Replace the generated page with your real business UI`)
