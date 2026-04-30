import electronRenderer from 'electron/renderer'

const { contextBridge, ipcRenderer } = electronRenderer

contextBridge.exposeInMainWorld('aiTalentDesktop', {
  isDesktop: true,
  getAppMetadata: () => ipcRenderer.invoke('app:get-metadata'),
})
