import { shellConfig } from '@/config/shell'
import { registeredApps } from './manifest'

export const appRegistry = Object.fromEntries(registeredApps.map((app) => [app.id, app]))

export function resolveActiveApp() {
  return appRegistry[shellConfig.activeAppId] ?? registeredApps[0]
}

export const activeApp = resolveActiveApp()
