import electronRenderer from 'electron/renderer'

const { contextBridge, ipcRenderer } = electronRenderer

contextBridge.exposeInMainWorld('desktopApp', {
  isDesktop: true,
  getAppMetadata: () => ipcRenderer.invoke('app:get-metadata'),
  getRuntimeInfo: () => ipcRenderer.invoke('app:get-runtime-info'),
  openExternal: (targetUrl) => ipcRenderer.invoke('shell:open-external', targetUrl),
})
