const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("petWindow", {
  startDrag: () => ipcRenderer.send("pet-drag-start"),
  moveDrag: () => ipcRenderer.send("pet-drag-move"),
  endDrag: () => ipcRenderer.send("pet-drag-end"),
});
