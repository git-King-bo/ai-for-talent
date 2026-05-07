const desktopBridge =
  typeof window !== 'undefined' && 'desktopApp' in window ? window.desktopApp : null

export function isDesktopRuntime() {
  return Boolean(desktopBridge?.isDesktop)
}

export function getRuntimeBadge() {
  return isDesktopRuntime() ? 'Desktop runtime' : 'Browser preview'
}

export async function getAppMetadata() {
  if (!desktopBridge?.getAppMetadata) {
    return {
      name: 'Electron Launchpad',
      version: 'dev',
      isPackaged: false,
      platform: 'web',
    }
  }

  return desktopBridge.getAppMetadata()
}

export async function getRuntimeInfo() {
  if (!desktopBridge?.getRuntimeInfo) {
    return {
      name: 'Electron Launchpad',
      version: 'dev',
      isPackaged: false,
      platform: 'browser',
      arch: 'n/a',
      osRelease: 'n/a',
      electronVersion: 'n/a',
      chromeVersion: navigator.userAgent,
      nodeVersion: 'n/a',
      userDataPath: 'Available in Electron runtime',
      logsPath: 'Available in Electron runtime',
      homePath: 'Available in Electron runtime',
    }
  }

  return desktopBridge.getRuntimeInfo()
}

export async function openExternal(targetUrl) {
  if (!desktopBridge?.openExternal) {
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
    return false
  }

  return desktopBridge.openExternal(targetUrl)
}
