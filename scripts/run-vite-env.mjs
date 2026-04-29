import { spawn } from 'node:child_process'
import path from 'node:path'

const command = process.argv[2]
const appEnv = (process.env.TAURI_APP_ENV || 'dev').trim().toLowerCase()
const allowedCommands = new Set(['dev', 'build'])
const allowedEnvs = new Set(['dev', 'test', 'pre', 'prod'])

if (!allowedCommands.has(command)) {
  console.error('Usage: node scripts/run-vite-env.mjs <dev|build>')
  process.exit(1)
}

if (!allowedEnvs.has(appEnv)) {
  console.error(`Invalid TAURI_APP_ENV "${appEnv}". Use one of: dev, test, pre, prod.`)
  process.exit(1)
}

const viteBin = path.join(
  process.cwd(),
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'vite.cmd' : 'vite',
)

const viteMode = `desktop-${appEnv}`
const viteArgs = command === 'build' ? ['build', '--mode', viteMode] : ['--mode', viteMode]

console.log(`Starting Vite ${command} with mode "${viteMode}"...`)

const child = spawn(viteBin, viteArgs, {
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
