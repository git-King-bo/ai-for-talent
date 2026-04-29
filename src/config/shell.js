import shellManifest from '../../shell.config.json'

function readEnv(name, fallback) {
  const value = import.meta.env[name]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const manifestApp = shellManifest.app || {}
const manifestBootSplash = shellManifest.bootSplash || {}
const manifestTauri = shellManifest.tauri || {}
const fallbackAppName = manifestApp.name || manifestTauri.productName || 'Desktop Workspace'

export const shellConfig = {
  appName: readEnv('VITE_APP_NAME', fallbackAppName),
  titleSuffix: readEnv('VITE_APP_TITLE_SUFFIX', manifestApp.titleSuffix || fallbackAppName),
  background: readEnv('VITE_SHELL_BACKGROUND', manifestApp.background || 'none'),
  activeAppId: readEnv('VITE_SHELL_APP_ID', manifestApp.activeAppId || 'starter'),
  bootSplash: {
    badge: readEnv('VITE_BOOT_BADGE', manifestBootSplash.badge || 'Desktop Launch Sequence'),
    title: readEnv('VITE_BOOT_TITLE', manifestBootSplash.title || fallbackAppName),
    subtitle: readEnv(
      'VITE_BOOT_SUBTITLE',
      manifestBootSplash.subtitle || 'Preparing the desktop workspace shell.',
    ),
    status: readEnv('VITE_BOOT_STATUS', manifestBootSplash.status || 'Booting desktop shell'),
    runtimeLabel: readEnv(
      'VITE_BOOT_RUNTIME_LABEL',
      manifestBootSplash.runtimeLabel || 'Vue + Tauri',
    ),
  },
}

export function resolveDocumentTitle(pageTitle) {
  return pageTitle ? `${pageTitle} | ${shellConfig.titleSuffix}` : shellConfig.titleSuffix
}
