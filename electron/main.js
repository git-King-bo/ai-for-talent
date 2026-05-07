import electronMain from 'electron/main'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const { app, BrowserWindow, ipcMain, session, shell } = electronMain

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const devServerUrl = process.env.VITE_DEV_SERVER_URL
const isDev = !app.isPackaged
const preloadPath = path.join(__dirname, 'preload.js')
const rendererIndexPath = path.join(__dirname, '../dist/index.html')

let mainWindow = null

function canOpenExternally(targetUrl) {
  try {
    const { protocol } = new URL(targetUrl)
    return protocol === 'https:' || protocol === 'mailto:'
  } catch {
    return false
  }
}

async function openExternalSafely(targetUrl) {
  if (!canOpenExternally(targetUrl)) {
    return
  }

  await shell.openExternal(targetUrl)
}

function isTrustedRendererUrl(targetUrl) {
  if (!targetUrl) {
    return false
  }

  if (isDev && devServerUrl) {
    return targetUrl.startsWith(devServerUrl)
  }

  return targetUrl.startsWith('file://')
}

function protectWebContents(contents) {
  contents.setWindowOpenHandler(({ url }) => {
    void openExternalSafely(url)

    return { action: 'deny' }
  })

  contents.on('will-navigate', (event, url) => {
    if (isTrustedRendererUrl(url)) {
      return
    }

    event.preventDefault()
    void openExternalSafely(url)
  })
}

function configureSessionSecurity() {
  session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false)
  })
}

function createMainWindow() {
  const window = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1200,
    minHeight: 760,
    backgroundColor: '#12100e',
    show: false,
    autoHideMenuBar: process.platform !== 'darwin',
    title: 'Electron Launchpad',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: false,
      webSecurity: true,
      devTools: isDev,
    },
  })

  window.once('ready-to-show', () => {
    window.show()
  })

  window.on('closed', () => {
    if (mainWindow === window) {
      mainWindow = null
    }
  })

  window.webContents.on('before-input-event', (event, input) => {
    const isToggleDevToolsShortcut =
      input.type === 'keyDown' &&
      (input.key === 'F12' || ((input.control || input.meta) && input.shift && input.key.toUpperCase() === 'I'))

    if (!isToggleDevToolsShortcut) {
      return
    }

    event.preventDefault()
    window.webContents.toggleDevTools()
  })

  if (isDev && devServerUrl) {
    void window.loadURL(devServerUrl)
  } else {
    void window.loadFile(rendererIndexPath)
  }

  return window
}

function registerIpcHandlers() {
  ipcMain.handle('app:get-metadata', () => ({
    name: app.getName(),
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    platform: process.platform,
  }))

  ipcMain.handle('app:get-runtime-info', () => ({
    name: app.getName(),
    version: app.getVersion(),
    isPackaged: app.isPackaged,
    platform: process.platform,
    arch: process.arch,
    osRelease: os.release(),
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
    nodeVersion: process.versions.node,
    userDataPath: app.getPath('userData'),
    logsPath: app.getPath('logs'),
    homePath: app.getPath('home'),
  }))

  ipcMain.handle('shell:open-external', async (_event, targetUrl) => {
    if (!canOpenExternally(targetUrl)) {
      return false
    }

    await shell.openExternal(targetUrl)
    return true
  })
}

const hasSingleInstanceLock = app.requestSingleInstanceLock()

if (!hasSingleInstanceLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!mainWindow) {
      return
    }

    if (mainWindow.isMinimized()) {
      mainWindow.restore()
    }

    mainWindow.focus()
  })

  app.whenReady().then(() => {
    app.setName('Electron Launchpad')
    app.setAppUserModelId('com.example.electronlaunchpad')
    configureSessionSecurity()
    registerIpcHandlers()
    mainWindow = createMainWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        mainWindow = createMainWindow()
      }
    })
  })
}

app.on('web-contents-created', (_event, contents) => {
  protectWebContents(contents)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
