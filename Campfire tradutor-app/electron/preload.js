const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  checkDeps: () => ipcRenderer.invoke('check-deps'),
  loadApiKey: () => ipcRenderer.invoke('load-api-key'),
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  traduzir: (caminho, idioma) => ipcRenderer.invoke('traduzir', caminho, idioma),
  onProgresso: (callback) => ipcRenderer.on('progresso', (_, msg) => callback(msg)),
  checkFileInfo: (caminho) => ipcRenderer.invoke('check-file-info', caminho),
})