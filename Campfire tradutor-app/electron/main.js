const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const { execSync, spawn } = require('child_process')

const CONFIG_PATH = path.join(app.getPath('userData'), 'campfire_config.json')

function lerConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {}
  return {}
}

function salvarConfig(dados) {
  try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(dados, null, 2)) } catch {}
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900, height: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  })
  const isDev = !app.isPackaged
  if (isDev) win.loadURL('http://localhost:5173')
  else win.loadFile(path.join(__dirname, '../dist/index.html'))
}

function checkCmd(cmd) {
  try { execSync(cmd, { stdio: 'ignore' }); return true } catch { return false }
}

ipcMain.handle('check-deps', () => ({
  python: app.isPackaged ? true : checkCmd('python --version'),
  ffmpeg: checkCmd('ffmpeg -version'),
}))

ipcMain.handle('load-api-key', () => lerConfig().apiKey || null)

ipcMain.handle('save-api-key', (_, key) => {
  const config = lerConfig()
  config.apiKey = key
  salvarConfig(config)
  return true
})

ipcMain.handle('open-url', (_, url) => shell.openExternal(url))

// Recebe as extensões do modo selecionado no frontend (ex: ['.png', '.jpg'])
// e usa no filtro do diálogo — sem isso imagens e Nintendo nunca apareciam
ipcMain.handle('select-file', async (_, exts) => {
  // Remove o ponto das extensões pois o Electron não usa ponto no filtro
  const extsSemPonto = exts && exts.length > 0
    ? exts.map(e => e.replace('.', ''))
    : [
        // Fallback com todas as extensões suportadas caso nenhuma seja passada
        'txt','srt','json','xml','csv','mkv','mp4','pdf','mp3','epub',
        'bin','dat','iso','zip','rar',
        'nds','3ds','nsp','xci',
        'jpg','jpeg','png','webp','gif'
      ]

  const result = await dialog.showOpenDialog({
    title: 'Escolha o arquivo para traduzir',
    filters: [
      { name: 'Suportados', extensions: extsSemPonto },
      { name: 'Todos', extensions: ['*'] }
    ]
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Escolha a pasta para traduzir em lote',
    properties: ['openDirectory']
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('traduzir', (event, caminho, idioma) => {
  const apiKey = lerConfig().apiKey || ''
  return new Promise((resolve, reject) => {
    let processo

    if (app.isPackaged) {
      const exePath = path.join(process.resourcesPath, 'python_dist', 'tradutor', 'tradutor.exe')
      processo = spawn(exePath, [caminho, idioma, apiKey])
    } else {
      const scriptPath = path.join(__dirname, '..', 'tradutor.py')
      processo = spawn('python', [scriptPath, caminho, idioma, apiKey])
    }

    processo.stdout.on('data', (data) => event.sender.send('progresso', data.toString()))
    processo.stderr.on('data', (data) => event.sender.send('progresso', `AVISO: ${data.toString()}`))
    processo.on('close', (code) => code === 0 ? resolve('ok') : reject('Erro na tradução'))
  })
})

ipcMain.handle('check-file-info', async (_, caminho) => {
  try {
    const stats = fs.statSync(caminho)
    const ext = path.join(caminho).split('.').pop().toLowerCase()
    return { size: stats.size, ext }
  } catch {
    return { size: 0, ext: '' }
  }
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })