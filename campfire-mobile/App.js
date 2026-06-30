import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Platform, Modal
} from 'react-native'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { CameraView, useCameraPermissions } from 'expo-camera'

// ─── Constantes ───────────────────────────────────────────────────────────────

const IDIOMAS = [
  { label: '🇧🇷 Português Brasileiro', value: 'português brasileiro coloquial' },
  { label: '🇵🇹 Português Europeu',    value: 'português europeu' },
  { label: '🇺🇸 English',              value: 'english' },
  { label: '🇪🇸 Español',              value: 'español' },
  { label: '🇫🇷 Français',             value: 'français' },
  { label: '🇩🇪 Deutsch',              value: 'deutsch' },
  { label: '🇮🇹 Italiano',             value: 'italiano' },
  { label: '🇯🇵 日本語',               value: 'japonês' },
  { label: '🇰🇷 한국어',               value: 'coreano' },
  { label: '🇨🇳 中文',                 value: 'chinês simplificado' },
  { label: '🇷🇺 Русский',              value: 'russo' },
  { label: '🇸🇦 العربية',              value: 'árabe' },
]

const MYMEMORY_CODES = {
  'português brasileiro coloquial': 'pt-BR', 'português europeu': 'pt-PT',
  'english': 'en', 'español': 'es', 'français': 'fr', 'deutsch': 'de',
  'italiano': 'it', 'japonês': 'ja', 'coreano': 'ko',
  'chinês simplificado': 'zh-CN', 'russo': 'ru', 'árabe': 'ar',
}

const LIBRETRANSLATE_CODES = {
  'português brasileiro coloquial': 'pt', 'português europeu': 'pt',
  'english': 'en', 'español': 'es', 'français': 'fr', 'deutsch': 'de',
  'italiano': 'it', 'japonês': 'ja', 'coreano': 'ko',
  'chinês simplificado': 'zh', 'russo': 'ru', 'árabe': 'ar',
}

const MODOS = [
  {
    id: 'texto', icone: '📄', label: 'Texto / Documento',
    desc: '.txt · .srt · .json · .xml · .csv',
    exts: ['txt', 'srt', 'json', 'xml', 'csv'],
    tipo: 'direto', badge: '✨ DIRETO', badgeColor: '#2a7a2a', aviso: null,
  },
  {
    id: 'pdf', icone: '📕', label: 'PDF',
    desc: '.pdf', exts: ['pdf'],
    tipo: 'pdf_direto', badge: '✨ DIRETO', badgeColor: '#2a7a2a',
    aviso: null,
  },
  {
    id: 'imagem', icone: '🖼️', label: 'Imagem / Painel',
    desc: '.jpg · .jpeg · .png · .webp',
    exts: ['jpg', 'jpeg', 'png', 'webp'],
    tipo: 'claude_direto', badge: '🤖 CLAUDE', badgeColor: '#6a2a6a',
    aviso: 'Usa Claude Vision. Requer chave Anthropic.',
  },
  {
    id: 'audio', icone: '🎵', label: 'Áudio / Vídeo',
    desc: '.mp3 · .mp4 · .mkv',
    exts: ['mp3', 'mp4', 'mkv'],
    tipo: 'servidor', badge: '🖥️ PC', badgeColor: '#2a4a7a',
    aviso: 'Requer servidor rodando no PC.',
  },
  {
    id: 'arquivo', icone: '📦', label: 'Arquivo Compactado',
    desc: '.zip · .rar', exts: ['zip', 'rar'],
    tipo: 'servidor', badge: '🖥️ PC', badgeColor: '#2a4a7a',
    aviso: 'Requer servidor rodando no PC.',
  },
]

// ─── Funções de tradução gratuita ────────────────────────────────────────────

async function traduzirMyMemory(texto, origCode, destCode) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto.slice(0, 500))}&langpair=${origCode}|${destCode}`
    const resp = await fetch(url, { signal: controller.signal })
    clearTimeout(timeout)
    if (!resp.ok) return null
    const data = await resp.json()
    if (data.responseStatus === 200) return data.responseData.translatedText
  } catch { clearTimeout(timeout) }
  return null
}

async function traduzirLibreTranslate(texto, origCode, destCode) {
  const servidores = ['https://translate.terraprint.co', 'https://libretranslate.de']
  for (const servidor of servidores) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    try {
      const resp = await fetch(`${servidor}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: texto.slice(0, 500),
          source: origCode.split('-')[0],
          target: destCode.split('-')[0],
          format: 'text',
        }),
        signal: controller.signal,
      })
      clearTimeout(timeout)
      if (resp.ok) {
        const data = await resp.json()
        if (data.translatedText) return data.translatedText
      }
    } catch { clearTimeout(timeout) }
  }
  return null
}

async function traduzirClaude(texto, idioma, apiKey) {
  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: `Traduza para ${idioma}. Responda APENAS com a tradução:\n\n${texto}` }],
    }),
  })
  if (!resp.ok) {
    const err = await resp.json()
    throw new Error(err.error?.message || 'Erro na API Claude')
  }
  const data = await resp.json()
  return data.content?.[0]?.text || texto
}

function avaliarQualidade(original, traducao) {
  if (!traducao || !original) return false
  const ratio = traducao.length / Math.max(original.length, 1)
  if (ratio < 0.3 || ratio > 4.0) return false
  if (traducao.trim().toLowerCase() === original.trim().toLowerCase()) return false
  const erros = ['translation not found', 'no translation', 'error', 'quota exceeded', 'invalid']
  if (erros.some(e => traducao.toLowerCase().includes(e))) return false
  return true
}

async function traduzirSegmento(texto, idioma, apiKey, setLog) {
  const origCode = 'en'
  const destMM = MYMEMORY_CODES[idioma] || 'pt-BR'
  const destLT = LIBRETRANSLATE_CODES[idioma] || 'pt'

  setLog?.('Tentando tradução gratuita (MyMemory)...')
  const trad1 = await traduzirMyMemory(texto, origCode, destMM)
  if (avaliarQualidade(texto, trad1)) return trad1

  setLog?.('Tentando tradução gratuita (LibreTranslate)...')
  const trad2 = await traduzirLibreTranslate(texto, origCode, destLT)
  if (avaliarQualidade(texto, trad2)) return trad2

  if (!apiKey) throw { tipo: 'CLAUDE_NECESSARIO', motivo: 'A tradução gratuita não foi suficiente para este conteúdo.' }

  setLog?.('Usando Claude para melhor qualidade...')
  return await traduzirClaude(texto, idioma, apiKey)
}

// ─── Processadores de arquivo direto ─────────────────────────────────────────

async function processarTXT(conteudo, idioma, apiKey, setLog) {
  const linhas = conteudo.split('\n').filter(l => l.trim())
  const resultado = []
  for (let i = 0; i < linhas.length; i++) {
    setLog?.(`Linha ${i + 1}/${linhas.length}...`)
    resultado.push(await traduzirSegmento(linhas[i], idioma, apiKey, setLog))
  }
  return resultado.join('\n')
}

async function processarSRT(conteudo, idioma, apiKey, setLog) {
  const blocos = conteudo.trim().split(/\n\n+/)
  const resultado = []
  for (let i = 0; i < blocos.length; i++) {
    const linhas = blocos[i].trim().split('\n')
    if (linhas.length >= 3) {
      setLog?.(`Bloco ${i + 1}/${blocos.length}...`)
      const texto = linhas.slice(2).join('\n')
      const trad = await traduzirSegmento(texto, idioma, apiKey, setLog)
      resultado.push(`${linhas[0]}\n${linhas[1]}\n${trad}`)
    } else {
      resultado.push(blocos[i])
    }
  }
  return resultado.join('\n\n')
}

async function processarJSON(conteudo, idioma, apiKey, setLog) {
  const dados = JSON.parse(conteudo)
  async function traduzirObj(obj) {
    if (typeof obj === 'string' && obj.trim())
      return await traduzirSegmento(obj, idioma, apiKey, setLog)
    if (Array.isArray(obj)) return Promise.all(obj.map(traduzirObj))
    if (typeof obj === 'object' && obj !== null) {
      const novo = {}
      for (const [k, v] of Object.entries(obj)) novo[k] = await traduzirObj(v)
      return novo
    }
    return obj
  }
  return JSON.stringify(await traduzirObj(dados), null, 2)
}

async function processarPDF(arquivo, idioma, apiKey, setLog) {
  setLog?.('Lendo PDF...')

  // ── Carrega pdfjs-dist ────────────────────────────────────────────────────
  let pdfjsLib
  try {
    pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
    pdfjsLib.GlobalWorkerOptions.workerSrc = false
  } catch (e) {
    throw { tipo: 'CLAUDE_NECESSARIO', motivo: 'Não foi possível carregar o leitor de PDF. Tente com um servidor.' }
  }

  // ── Lê o arquivo como base64 e converte para ArrayBuffer ─────────────────
  const base64 = await FileSystem.readAsStringAsync(arquivo.uri, {
    encoding: FileSystem.EncodingType.Base64
  })
  const binary = atob(base64)
  const bytes  = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

  // ── Extrai texto de cada página ───────────────────────────────────────────
  const pdf    = await pdfjsLib.getDocument({ data: bytes }).promise
  const paginas = []

  for (let i = 1; i <= pdf.numPages; i++) {
    setLog?.(`Extraindo página ${i}/${pdf.numPages}...`)
    const page    = await pdf.getPage(i)
    const content = await page.getTextContent()
    const texto   = content.items.map(item => item.str).join(' ').trim()
    if (texto) paginas.push(texto)
  }

  // ── PDF escaneado — sem texto extraível ───────────────────────────────────
  if (paginas.length === 0) {
    throw {
      tipo: 'CLAUDE_NECESSARIO',
      motivo: 'Este PDF é escaneado (imagem) e não contém texto selecionável. Para traduzir PDFs escaneados, adicione sua chave Anthropic nas configurações.'
    }
  }

  // ── Traduz página por página ──────────────────────────────────────────────
  const traduzidas = []
  for (let i = 0; i < paginas.length; i++) {
    setLog?.(`Traduzindo página ${i + 1}/${paginas.length}...`)
    const trad = await traduzirSegmento(paginas[i], idioma, apiKey, setLog)
    traduzidas.push(`=== Página ${i + 1} ===\n${trad}`)
  }

  return traduzidas.join('\n\n')
}

async function processarImagem(arquivo, idioma, apiKey) {
  if (!apiKey) throw { tipo: 'CLAUDE_NECESSARIO', motivo: 'Tradução de imagens requer a chave Anthropic (Claude Vision).' }

  const TIPOS_MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' }
  const ext  = arquivo.name.split('.').pop().toLowerCase()
  const mime = TIPOS_MIME[ext] || 'image/jpeg'
  const base64 = await FileSystem.readAsStringAsync(arquivo.uri, {
    encoding: FileSystem.EncodingType.Base64
  })

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mime, data: base64 } },
          { type: 'text', text: `Analise esta imagem e extraia TODO o texto visível.\n\nPara cada trecho:\n[ORIGINAL]: texto\n[TRADUÇÃO]: tradução para ${idioma}\n---\n\nSe não houver texto: SEM_TEXTO` },
        ],
      }],
    }),
  })
  if (!resp.ok) { const err = await resp.json(); throw new Error(err.error?.message || 'Erro Claude Vision') }
  const data = await resp.json()
  return data.content?.[0]?.text || 'Nenhum texto encontrado.'
}

// ─── App principal ────────────────────────────────────────────────────────────

export default function App() {
  const [tela, setTela]                     = useState('modos')
  const [serverIp, setServerIp]             = useState('')
  const [apiKey, setApiKey]                 = useState('')
  const [modo, setModo]                     = useState(null)
  const [arquivo, setArquivo]               = useState(null)
  const [idioma, setIdioma]                 = useState(IDIOMAS[0].value)
  const [idiomaLabel, setIdiomaLabel]       = useState(IDIOMAS[0].label)
  const [mostrarIdiomas, setMostrarIdiomas] = useState(false)
  const [status, setStatus]                 = useState('idle')
  const [log, setLog]                       = useState('')
  const [onboardingMotivo, setOnboardingMotivo] = useState('')
  const [mostrarQR, setMostrarQR]           = useState(false)
  const [qrEscaneado, setQrEscaneado]       = useState(false)
  const [qrPermission, requestQrPermission] = useCameraPermissions()

  useEffect(() => {
    AsyncStorage.getItem('serverIp').then(v => { if (v) setServerIp(v) })
    AsyncStorage.getItem('apiKey').then(v => { if (v) setApiKey(v) })
  }, [])

  async function salvarConfigs() {
    await AsyncStorage.setItem('serverIp', serverIp)
    await AsyncStorage.setItem('apiKey', apiKey)
    setLog('✅ Configurações salvas!')
    setTimeout(() => { setLog(''); setTela('modos') }, 800)
  }

  async function abrirQR() {
    if (!qrPermission?.granted) {
      const { granted } = await requestQrPermission()
      if (!granted) { Alert.alert('Permissão de câmera necessária para escanear o QR.'); return }
    }
    setQrEscaneado(false)
    setMostrarQR(true)
  }

  function onQREscaneado({ data }) {
    if (qrEscaneado) return
    setQrEscaneado(true)
    setServerIp(data)
    setMostrarQR(false)
    Alert.alert('✅ IP detectado!', `Servidor configurado: ${data}`)
  }

  async function selecionarArquivo() {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true })
    if (!result.canceled && result.assets?.length > 0) {
      setArquivo(result.assets[0])
      setStatus('idle')
      setLog('')
    }
  }

  async function traduzir() {
    if (!arquivo) { Alert.alert('Selecione um arquivo primeiro.'); return }
    setStatus('traduzindo')
    setLog('Iniciando tradução...')

    try {
      const ext = arquivo.name.split('.').pop().toLowerCase()

      // ── Modo DIRETO (texto) ────────────────────────────────────────────────
      if (modo.tipo === 'direto') {
        let resultado = ''
        if (ext === 'txt') {
          const c = await FileSystem.readAsStringAsync(arquivo.uri)
          resultado = await processarTXT(c, idioma, apiKey, setLog)
        } else if (ext === 'srt') {
          const c = await FileSystem.readAsStringAsync(arquivo.uri)
          resultado = await processarSRT(c, idioma, apiKey, setLog)
        } else if (ext === 'json') {
          const c = await FileSystem.readAsStringAsync(arquivo.uri)
          resultado = await processarJSON(c, idioma, apiKey, setLog)
        } else {
          const c = await FileSystem.readAsStringAsync(arquivo.uri)
          resultado = await processarTXT(c, idioma, apiKey, setLog)
        }
        const nomeSaida = arquivo.name.replace(/\.[^.]+$/, `_traduzido.${ext}`)
        const caminho   = FileSystem.documentDirectory + nomeSaida
        await FileSystem.writeAsStringAsync(caminho, resultado, { encoding: FileSystem.EncodingType.UTF8 })
        setStatus('concluido')
        setLog('✅ Tradução concluída!')
        await Sharing.shareAsync(caminho)
        return
      }

      // ── Modo PDF DIRETO ────────────────────────────────────────────────────
      if (modo.tipo === 'pdf_direto') {
        const resultado = await processarPDF(arquivo, idioma, apiKey, setLog)
        const nomeSaida = arquivo.name.replace(/\.[^.]+$/, '_traduzido.txt')
        const caminho   = FileSystem.documentDirectory + nomeSaida
        await FileSystem.writeAsStringAsync(caminho, resultado, { encoding: FileSystem.EncodingType.UTF8 })
        setStatus('concluido')
        setLog('✅ Tradução concluída!')
        await Sharing.shareAsync(caminho)
        return
      }

      // ── Modo CLAUDE DIRETO (imagens) ───────────────────────────────────────
      if (modo.tipo === 'claude_direto') {
        const resultado = await processarImagem(arquivo, idioma, apiKey)
        const nomeSaida = arquivo.name.replace(/\.[^.]+$/, '_traducao.txt')
        const caminho   = FileSystem.documentDirectory + nomeSaida
        await FileSystem.writeAsStringAsync(caminho, resultado, { encoding: FileSystem.EncodingType.UTF8 })
        setStatus('concluido')
        setLog('✅ Tradução concluída!')
        await Sharing.shareAsync(caminho)
        return
      }

      // ── Modo SERVIDOR ──────────────────────────────────────────────────────
      if (!serverIp) {
        Alert.alert('Servidor necessário', 'Configure o IP do PC nas configurações (⚙️).')
        setStatus('idle')
        return
      }

      setLog('Enviando para o servidor...')
      const formData = new FormData()
      formData.append('arquivo', { uri: arquivo.uri, name: arquivo.name, type: arquivo.mimeType || 'application/octet-stream' })
      formData.append('idioma', idioma)
      formData.append('api_key', apiKey)

      setLog('Traduzindo no servidor...')
      const res = await fetch(`http://${serverIp}:8000/traduzir`, { method: 'POST', body: formData })

      if (res.status === 402) {
        const err = await res.json()
        setOnboardingMotivo(err.motivo || 'Este arquivo requer IA avançada.')
        setStatus('idle')
        setTela('onboarding')
        return
      }

      if (!res.ok) {
        const err = await res.json()
        setLog(`❌ Erro: ${err.erro}`)
        setStatus('erro')
        return
      }

      const blob = await res.blob()
      const nomeSaida = arquivo.name.replace(/\.[^.]+$/, '') + '_traduzido.' + arquivo.name.split('.').pop()
      const caminho   = FileSystem.documentDirectory + nomeSaida

      const reader = new FileReader()
      reader.onload = async () => {
        const base64 = reader.result.split(',')[1]
        await FileSystem.writeAsBase64Async(caminho, base64)
        setStatus('concluido')
        setLog('✅ Tradução concluída!')
        await Sharing.shareAsync(caminho)
      }
      reader.readAsDataURL(blob)

    } catch (e) {
      if (e?.tipo === 'CLAUDE_NECESSARIO') {
        setOnboardingMotivo(e.motivo)
        setStatus('idle')
        setTela('onboarding')
      } else {
        setLog(`❌ Erro: ${e.message || String(e)}`)
        setStatus('erro')
      }
    }
  }

  // ── Tela Setup ─────────────────────────────────────────────────────────────
  if (tela === 'setup') return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>🔥 Campfire Mobile</Text>
      <Text style={s.sub}>Configure o app. Tudo é opcional!</Text>

      <View style={s.card}>
        <Text style={s.label}>🖥️ IP do Servidor (opcional)</Text>
        <Text style={s.hint}>Necessário apenas para áudio/vídeo e arquivos compactados.</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={[s.input, { flex: 1 }]}
            placeholder="ex: 192.168.1.10"
            placeholderTextColor="#666"
            value={serverIp}
            onChangeText={setServerIp}
            autoCapitalize="none"
            keyboardType="numeric"
          />
          <TouchableOpacity style={s.btnQR} onPress={abrirQR}>
            <Text style={{ fontSize: 22 }}>📷</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>📷 Escaneie o QR gerado pelo servidor no PC.</Text>
      </View>

      <View style={s.card}>
        <Text style={s.label}>🤖 Chave de API Anthropic (opcional)</Text>
        <Text style={s.hint}>Necessária para imagens (Claude Vision) e quando a tradução gratuita não for suficiente.</Text>
        <TextInput
          style={s.input}
          placeholder="sk-ant-..."
          placeholderTextColor="#666"
          value={apiKey}
          onChangeText={setApiKey}
          autoCapitalize="none"
          secureTextEntry
        />
      </View>

      {log ? <Text style={s.logText}>{log}</Text> : null}

      <TouchableOpacity style={s.btnPrimario} onPress={salvarConfigs}>
        <Text style={s.btnPrimarioText}>Salvar e continuar →</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 14 }} onPress={() => setTela('modos')}>
        <Text style={{ color: '#555', fontSize: 13, textAlign: 'center' }}>Pular por agora</Text>
      </TouchableOpacity>

      <Modal visible={mostrarQR} animationType="slide">
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onQREscaneado}
          />
          <TouchableOpacity style={s.btnFecharQR} onPress={() => setMostrarQR(false)}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>✕ Fechar</Text>
          </TouchableOpacity>
          <Text style={s.qrInstrucao}>Aponte para o QR gerado pelo servidor</Text>
        </View>
      </Modal>
    </ScrollView>
  )

  // ── Tela Onboarding ────────────────────────────────────────────────────────
  if (tela === 'onboarding') return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={{ fontSize: 48, marginBottom: 8 }}>🤖</Text>
      <Text style={[s.title, { fontSize: 22, textAlign: 'center' }]}>IA Avançada Necessária</Text>
      <Text style={[s.sub, { textAlign: 'center', marginBottom: 20 }]}>{onboardingMotivo}</Text>

      <View style={s.card}>
        <Text style={[s.label, { color: '#fff', marginBottom: 14 }]}>Como obter sua chave gratuita:</Text>
        {[
          { n: '1', titulo: 'Criar conta gratuita', desc: 'Acesse console.anthropic.com e crie sua conta.' },
          { n: '2', titulo: 'Adicionar créditos (mínimo U$5)', desc: 'Vá em Billing → Add Credits. Equivale a ~R$26 e dura bastante.' },
          { n: '3', titulo: 'Criar chave API', desc: 'Vá em API Keys → Create Key. Copie a chave que começa com sk-ant-' },
          { n: '4', titulo: 'Cole nas configurações do app', desc: 'Toque em ⚙️ Configurações e cole a chave no campo indicado.' },
        ].map(p => (
          <View key={p.n} style={s.passo}>
            <Text style={s.passoNum}>{p.n}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.passoTitulo}>{p.titulo}</Text>
              <Text style={s.passoDesc}>{p.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.btnPrimario} onPress={() => setTela('setup')}>
        <Text style={s.btnPrimarioText}>⚙️ Ir para Configurações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ marginTop: 14 }} onPress={() => { setTela('modos'); setStatus('idle') }}>
        <Text style={{ color: '#555', fontSize: 13, textAlign: 'center' }}>← Voltar aos modos</Text>
      </TouchableOpacity>
    </ScrollView>
  )

  // ── Tela Modos ─────────────────────────────────────────────────────────────
  if (tela === 'modos') return (
    <View style={s.container}>
      <Text style={s.title}>🔥 Campfire</Text>
      <Text style={s.sub}>Selecione o tipo de arquivo</Text>

      <ScrollView style={{ width: '100%' }} contentContainerStyle={{ gap: 10, paddingBottom: 80 }}>
        {MODOS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={s.cardModo}
            onPress={() => { setModo(m); setArquivo(null); setStatus('idle'); setLog(''); setTela('tradutor') }}
          >
            <Text style={s.modoIcone}>{m.icone}</Text>
            <View style={{ flex: 1 }}>
              <Text style={s.modoLabel}>{m.label}</Text>
              <Text style={s.modoDesc}>{m.desc}</Text>
            </View>
            <View style={[s.modoBadgePill, { backgroundColor: m.badgeColor }]}>
              <Text style={s.modoBadgeText}>{m.badge}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={s.btnTrocar} onPress={() => setTela('setup')}>
        <Text style={s.btnTrocarText}>⚙️ Configurações</Text>
      </TouchableOpacity>
    </View>
  )

  // ── Tela Tradutor ──────────────────────────────────────────────────────────
  return (
    <View style={s.container}>
      <View style={s.cabecalho}>
        <TouchableOpacity onPress={() => { setTela('modos'); setArquivo(null); setStatus('idle'); setLog('') }}>
          <Text style={s.btnVoltar}>← Voltar</Text>
        </TouchableOpacity>
        <View style={[s.modoBadgePill, { backgroundColor: modo?.badgeColor }]}>
          <Text style={s.modoBadgeText}>{modo?.badge}</Text>
        </View>
      </View>

      <Text style={s.title}>🔥 Campfire</Text>

      {modo?.aviso && (
        <View style={s.avisoModo}>
          <Text style={s.avisoModoText}>{modo.aviso}</Text>
        </View>
      )}

      {modo?.tipo === 'servidor' && !serverIp && (
        <View style={[s.avisoModo, { borderColor: '#f55' }]}>
          <Text style={[s.avisoModoText, { color: '#f55' }]}>
            ⚠️ Servidor não configurado. Toque em ⚙️ e adicione o IP do PC.
          </Text>
        </View>
      )}

      <TouchableOpacity style={s.btnSecundario} onPress={selecionarArquivo}>
        <Text style={s.btnSecundarioText}>
          {arquivo ? `📄 ${arquivo.name}` : '+ Selecionar arquivo'}
        </Text>
      </TouchableOpacity>

      {modo?.desc && <Text style={s.extsAceitas}>Extensões: {modo.desc}</Text>}

      <TouchableOpacity style={s.seletorIdioma} onPress={() => setMostrarIdiomas(!mostrarIdiomas)}>
        <Text style={s.seletorIdiomaText}>{idiomaLabel} ▾</Text>
      </TouchableOpacity>

      {mostrarIdiomas && (
        <ScrollView style={s.listaIdiomas} nestedScrollEnabled>
          {IDIOMAS.map(l => (
            <TouchableOpacity key={l.value} style={s.itemIdioma} onPress={() => {
              setIdioma(l.value); setIdiomaLabel(l.label); setMostrarIdiomas(false)
            }}>
              <Text style={[s.itemIdiomaText, idioma === l.value && { color: '#f90' }]}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {arquivo && status !== 'traduzindo' && (
        <TouchableOpacity style={s.btnPrimario} onPress={traduzir}>
          <Text style={s.btnPrimarioText}>Traduzir →</Text>
        </TouchableOpacity>
      )}

      {status === 'traduzindo' && <ActivityIndicator size="large" color="#f90" style={{ marginTop: 16 }} />}

      {log ? <Text style={[
        s.logText,
        status === 'erro' && { color: '#f55' },
        status === 'concluido' && { color: '#4f4' },
      ]}>{log}</Text> : null}

      <TouchableOpacity style={s.btnTrocar} onPress={() => setTela('setup')}>
        <Text style={s.btnTrocarText}>⚙️ Configurações</Text>
      </TouchableOpacity>
    </View>
  )
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, color: '#fff', fontWeight: 'bold', marginBottom: 6 },
  sub: { color: '#aaa', marginBottom: 16, fontSize: 14 },
  card: { backgroundColor: '#242424', borderRadius: 12, padding: 16, width: '100%', marginBottom: 14 },
  label: { color: '#f90', fontWeight: 'bold', marginBottom: 4, fontSize: 14 },
  hint: { color: '#888', fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: '#333', borderRadius: 8, padding: 10, color: '#fff', fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' },
  btnQR: { backgroundColor: '#333', borderRadius: 8, padding: 10, alignItems: 'center', justifyContent: 'center', width: 46 },
  btnPrimario: { backgroundColor: '#f90', borderRadius: 10, paddingVertical: 13, paddingHorizontal: 40, marginTop: 12 },
  btnPrimarioText: { color: '#000', fontWeight: 'bold', fontSize: 16 },
  btnSecundario: { backgroundColor: '#333', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, width: '100%', alignItems: 'center', marginBottom: 10 },
  btnSecundarioText: { color: '#fff', fontSize: 15 },
  seletorIdioma: { backgroundColor: '#333', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 16, width: '100%', alignItems: 'center', marginBottom: 10 },
  seletorIdiomaText: { color: '#fff', fontSize: 15 },
  listaIdiomas: { width: '100%', backgroundColor: '#242424', borderRadius: 10, maxHeight: 200, marginBottom: 10 },
  itemIdioma: { padding: 12, borderBottomWidth: 0.5, borderBottomColor: '#333' },
  itemIdiomaText: { color: '#fff', fontSize: 14 },
  logText: { color: '#aaa', marginTop: 14, textAlign: 'center', fontSize: 13 },
  btnTrocar: { position: 'absolute', bottom: 24, right: 24 },
  btnTrocarText: { color: '#555', fontSize: 13 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 8 },
  btnVoltar: { color: '#aaa', fontSize: 14, borderWidth: 1, borderColor: '#444', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  modoBadgePill: { borderRadius: 6, paddingVertical: 4, paddingHorizontal: 8 },
  modoBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  avisoModo: { backgroundColor: '#242424', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#f90', width: '100%', marginBottom: 10 },
  avisoModoText: { color: '#f90', fontSize: 12, textAlign: 'center' },
  extsAceitas: { color: '#555', fontSize: 11, marginBottom: 8 },
  cardModo: { backgroundColor: '#242424', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  modoIcone: { fontSize: 28 },
  modoLabel: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  modoDesc: { color: '#666', fontSize: 12, marginTop: 2 },
  btnFecharQR: { position: 'absolute', top: 50, right: 20, backgroundColor: 'rgba(0,0,0,0.7)', padding: 12, borderRadius: 8 },
  qrInstrucao: { position: 'absolute', bottom: 60, alignSelf: 'center', color: '#fff', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 8 },
  passo: { flexDirection: 'row', gap: 12, marginBottom: 14, alignItems: 'flex-start' },
  passoNum: { backgroundColor: '#f90', color: '#000', fontWeight: 'bold', fontSize: 14, width: 26, height: 26, borderRadius: 13, textAlign: 'center', lineHeight: 26 },
  passoTitulo: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 2 },
  passoDesc: { color: '#aaa', fontSize: 12 },
})