import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const electronBinary = require('electron')
const appArgs = process.argv.slice(2)
const childEnv = { ...process.env }

delete childEnv.ELECTRON_RUN_AS_NODE

const child = spawn(electronBinary, appArgs, {
  stdio: 'inherit',
  windowsHide: false,
  env: childEnv,
})

child.on('close', (code, signal) => {
  if (code === null) {
    console.error(`Electron exited with signal ${signal}`)
    process.exit(1)
  }

  process.exit(code)
})
