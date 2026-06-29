const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const { execSync, spawn } = require('child_process')

const CONFIG_PATH    = path.join(app.getPath('userData'), 'campfire_config.json')
const PROGRESS_DIR   = path.join(app.getPath('userData'), 'progress')

// Garante que a pasta de progresso existe
if (!fs.existsSync(PROGRESS_DIR)) fs.mkdirSync(PROGRESS_DIR, { recursive: true })

function lerConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'))
  } catch {}
  return {}
}

function salvarConfig(dados) {
  try { fs.writeFileSync(CONFIG_PATH, JSON.stringify(dados, null, 2)) } catch {}
}

// Gera um ID único pro arquivo baseado no caminho + idioma
function progressId(caminho, idioma) {
  return crypto.createHash('md5').update(`${caminho}||${idioma}`).digest('hex')
}

function progressPath(caminho, idioma) {
  return path.join(PROGRESS_DIR, `${progressId(caminho, idioma)}.json`)
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

ipcMain.handle('select-file', async (_, exts) => {
  const extsSemPonto = exts && exts.length > 0
    ? exts.map(e => e.replace('.', ''))
    : [
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
  const pPath  = progressPath(caminho, idioma)

  return new Promise((resolve, reject) => {
    let processo
    let saidaCompleta = ''

    if (app.isPackaged) {
      const exePath = path.join(process.resourcesPath, 'python_dist', 'tradutor', 'tradutor.exe')
      processo = spawn(exePath, [caminho, idioma, apiKey])
    } else {
      const scriptPath = path.join(__dirname, '..', 'tradutor.py')
      processo = spawn('python', [scriptPath, caminho, idioma, apiKey])
    }

    processo.stdout.on('data', (data) => {
      const msg = data.toString()
      saidaCompleta += msg
      event.sender.send('progresso', msg)

      // ── Salva progresso a cada batch/parte concluída ───────────────────────
      const matchBatch = msg.match(/Batch\s+(\d+)\/(\d+)/)
      const matchParte = msg.match(/Parte\s+(\d+)\/(\d+)/)
      const match = matchBatch || matchParte

      if (match) {
        const atual = parseInt(match[1])
        const total = parseInt(match[2])
        const tipo  = matchBatch ? 'batch' : 'parte'
        try {
          fs.writeFileSync(pPath, JSON.stringify({
            caminho,
            idioma,
            tipo,
            atual,
            total,
            pct: Math.round((atual / total) * 100),
            atualizado: new Date().toISOString(),
          }, null, 2))
        } catch {}
      }
    })

    processo.stderr.on('data', (data) => {
      event.sender.send('progresso', `AVISO: ${data.toString()}`)
    })

    processo.on('close', (code) => {
      if (code === 0) {
        // ── Limpa progresso quando concluído com sucesso ───────────────────
        try { if (fs.existsSync(pPath)) fs.unlinkSync(pPath) } catch {}
        resolve('ok')
      } else {
        // ── Mantém progresso salvo pra retomar depois ──────────────────────
        reject('Erro na tradução')
      }
    })
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

// ── Handlers de progresso ──────────────────────────────────────────────────
ipcMain.handle('check-progress', async (_, caminho, idioma) => {
  try {
    const pPath = progressPath(caminho, idioma)
    if (fs.existsSync(pPath)) {
      return JSON.parse(fs.readFileSync(pPath, 'utf-8'))
    }
  } catch {}
  return null
})

ipcMain.handle('clear-progress', async (_, caminho, idioma) => {
  try {
    const pPath = progressPath(caminho, idioma)
    if (fs.existsSync(pPath)) fs.unlinkSync(pPath)
  } catch {}
  return true
})

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })