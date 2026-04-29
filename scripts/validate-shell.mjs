import fs from 'node:fs'
import path from 'node:path'

const rootDir = process.cwd()
const shellConfigPath = path.join(rootDir, 'shell.config.json')
const appsDir = path.join(rootDir, 'src', 'apps')
const manifestPath = path.join(appsDir, 'manifest.js')

const failures = []

if (!fs.existsSync(shellConfigPath)) {
  failures.push('Missing shell.config.json')
}

if (!fs.existsSync(manifestPath)) {
  failures.push('Missing src/apps/manifest.js')
}

if (failures.length === 0) {
  const shellConfig = JSON.parse(fs.readFileSync(shellConfigPath, 'utf8'))
  const activeAppId = shellConfig.app?.activeAppId
  const background = shellConfig.app?.background
  const allowedBackgrounds = new Set(['none', 'talent', 'stars', 'starfield'])

  if (!activeAppId) {
    failures.push('shell.config.json is missing app.activeAppId')
  } else {
    const appEntryPath = path.join(appsDir, activeAppId, 'index.js')
    if (!fs.existsSync(appEntryPath)) {
      failures.push(`Active app id "${activeAppId}" is missing src/apps/${activeAppId}/index.js`)
    }
  }

  if (background && !allowedBackgrounds.has(background)) {
    failures.push(
      `Unsupported app.background "${background}". Allowed values: ${Array.from(allowedBackgrounds).join(', ')}`,
    )
  }

  const tauriConfig = shellConfig.tauri || {}
  for (const key of ['productName', 'identifier', 'publisher', 'windowTitle']) {
    if (!tauriConfig[key]) {
      failures.push(`shell.config.json is missing tauri.${key}`)
    }
  }
}

if (failures.length > 0) {
  console.error('Shell validation failed:')
  failures.forEach((failure) => console.error(`- ${failure}`))
  process.exit(1)
}

console.log('Shell validation passed.')
