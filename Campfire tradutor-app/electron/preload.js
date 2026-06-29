const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  checkDeps: () => ipcRenderer.invoke('check-deps'),
  loadApiKey: () => ipcRenderer.invoke('load-api-key'),
  saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
  openUrl: (url) => ipcRenderer.invoke('open-url', url),
  selectFile: (exts) => ipcRenderer.invoke('select-file', exts),
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  traduzir: (caminho, idioma) => ipcRenderer.invoke('traduzir', caminho, idioma),
  onProgresso: (callback) => ipcRenderer.on('progresso', (_, msg) => callback(msg)),
  checkFileInfo: (caminho) => ipcRenderer.invoke('check-file-info', caminho),
  // ── Progresso de tradução ──────────────────────────────────────────────────
  checkProgress: (caminho, idioma) => ipcRenderer.invoke('check-progress', caminho, idioma),
  clearProgress: (caminho, idioma) => ipcRenderer.invoke('clear-progress', caminho, idioma),
})