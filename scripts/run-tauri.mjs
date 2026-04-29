import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error('Usage: node scripts/run-tauri.mjs <tauri-command> [args...]')
  process.exit(1)
}

const rootDir = process.cwd()
const shellConfigPath = path.join(rootDir, 'shell.config.json')
const tauriConfigPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json')
const overrideDir = path.join(rootDir, '.tauri')
const overridePath = path.join(overrideDir, 'shell-overrides.json')
const tauriBin = path.join(
  rootDir,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'tauri.cmd' : 'tauri',
)

if (!fs.existsSync(shellConfigPath)) {
  console.error(`Missing shell config: ${shellConfigPath}`)
  process.exit(1)
}

if (!fs.existsSync(tauriConfigPath)) {
  console.error(`Missing base Tauri config: ${tauriConfigPath}`)
  process.exit(1)
}

const shellConfig = JSON.parse(fs.readFileSync(shellConfigPath, 'utf8'))
const baseTauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf8'))
const tauriConfig = shellConfig.tauri || {}
const productName = tauriConfig.productName || 'Desktop Workspace'
const baseWindows = Array.isArray(baseTauriConfig.app?.windows) ? baseTauriConfig.app.windows : []
const windows =
  baseWindows.length > 0
    ? baseWindows.map((windowConfig, index) =>
        index === 0
          ? {
              ...windowConfig,
              title: tauriConfig.windowTitle || productName,
            }
          : windowConfig,
      )
    : [
        {
          label: 'main',
          title: tauriConfig.windowTitle || productName,
        },
      ]

const overrides = {
  productName,
  identifier: tauriConfig.identifier || 'com.example.desktopworkspace',
  app: {
    windows,
  },
  bundle: {
    category: tauriConfig.category || 'Utility',
    publisher: tauriConfig.publisher || 'your-team',
    shortDescription:
      tauriConfig.shortDescription || 'Reusable Tauri desktop shell built on Vue and Vite.',
    longDescription:
      tauriConfig.longDescription ||
      'Reusable Tauri desktop shell with Vue and Vite that can be embedded into other projects.',
    windows: {
      nsis: {
        startMenuFolder: tauriConfig.windowsStartMenuFolder || productName,
      },
    },
  },
}

fs.mkdirSync(overrideDir, { recursive: true })
fs.writeFileSync(overridePath, `${JSON.stringify(overrides, null, 2)}\n`)

const finalArgs =
  args.includes('--config') || args.includes('-c') ? args : [...args, '--config', overridePath]

console.log(`Running Tauri with shell overrides from ${path.relative(rootDir, overridePath)}...`)

const child = spawn(tauriBin, finalArgs, {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exit(code ?? 0)
})
