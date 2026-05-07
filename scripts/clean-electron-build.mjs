import { rm } from 'node:fs/promises'

const targets = ['release', '.cache/electron', '.cache/electron-builder']

await Promise.all(
  targets.map(async (target) => {
    try {
      await rm(target, { recursive: true, force: true })
    } catch {
      // noop
    }
  }),
)
