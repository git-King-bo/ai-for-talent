import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import path from 'node:path'

const rootDir = process.cwd()
const releaseDir = path.join(rootDir, 'release')

const removableEntries = [
  'mac',
  'mac-arm64',
  'win-unpacked',
  'linux-unpacked',
  'builder-debug.yml',
  'builder-effective-config.yaml',
]

async function removeIfExists(targetPath) {
  if (!existsSync(targetPath)) {
    return
  }

  await rm(targetPath, { recursive: true, force: true })
}

async function main() {
  await Promise.all(
    removableEntries.map((entry) => removeIfExists(path.join(releaseDir, entry))),
  )
}

await main()
