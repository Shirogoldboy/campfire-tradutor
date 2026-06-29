import { useState, useEffect, useRef } from 'react'

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

const UI = {
  'português brasileiro coloquial': {
    titulo: '🔥 Campfire Tradutor', selecionar: '+ Selecionar arquivo',
    selecionarPasta: '+ Selecionar pasta', traduzir: 'Traduzir →',
    traduzindo: '⏳ Traduzindo...', concluido: '✅ Concluído! Veja os arquivos gerados na pasta.',
    erro: '❌ Erro na tradução. Veja o log abaixo.', voltar: '← Voltar',
  },
  'português europeu': {
    titulo: '🔥 Campfire Tradutor', selecionar: '+ Selecionar ficheiro',
    selecionarPasta: '+ Selecionar pasta', traduzir: 'Traduzir →',
    traduzindo: '⏳ A traduzir...', concluido: '✅ Concluído! Veja os ficheiros gerados na pasta.',
    erro: '❌ Erro na tradução. Veja o registo abaixo.', voltar: '← Voltar',
  },
  'english': {
    titulo: '🔥 Campfire Translator', selecionar: '+ Select file',
    selecionarPasta: '+ Select folder', traduzir: 'Translate →',
    traduzindo: '⏳ Translating...', concluido: '✅ Done! Check the generated files in the folder.',
    erro: '❌ Translation error. Check the log below.', voltar: '← Back',
  },
  'español': {
    titulo: '🔥 Campfire Traductor', selecionar: '+ Seleccionar archivo',
    selecionarPasta: '+ Seleccionar carpeta', traduzir: 'Traducir →',
    traduzindo: '⏳ Traduciendo...', concluido: '✅ ¡Listo! Revisa los archivos generados en la carpeta.',
    erro: '❌ Error en la traducción. Revisa el registro abajo.', voltar: '← Volver',
  },
  'français': {
    titulo: '🔥 Campfire Traducteur', selecionar: '+ Sélectionner un fichier',
    selecionarPasta: '+ Sélectionner un dossier', traduzir: 'Traduire →',
    traduzindo: '⏳ Traduction en cours...', concluido: '✅ Terminé ! Consultez les fichiers générés dans le dossier.',
    erro: '❌ Erreur de traduction. Voir le journal ci-dessous.', voltar: '← Retour',
  },
  'deutsch': {
    titulo: '🔥 Campfire Übersetzer', selecionar: '+ Datei auswählen',
    selecionarPasta: '+ Ordner auswählen', traduzir: 'Übersetzen →',
    traduzindo: '⏳ Übersetze...', concluido: '✅ Fertig! Sieh dir die erstellten Dateien im Ordner an.',
    erro: '❌ Übersetzungsfehler. Siehe Protokoll unten.', voltar: '← Zurück',
  },
  'italiano': {
    titulo: '🔥 Campfire Traduttore', selecionar: '+ Seleziona file',
    selecionarPasta: '+ Seleziona cartella', traduzir: 'Traduci →',
    traduzindo: '⏳ Traduzione in corso...', concluido: '✅ Fatto! Controlla i file generati nella cartella.',
    erro: '❌ Errore di traduzione. Vedi il registro sotto.', voltar: '← Indietro',
  },
  'japonês': {
    titulo: '🔥 Campfire 翻訳', selecionar: '+ ファイルを選択',
    selecionarPasta: '+ フォルダを選択', traduzir: '翻訳する →',
    traduzindo: '⏳ 翻訳中...', concluido: '✅ 完了！フォルダ内の生成ファイルを確認してください。',
    erro: '❌ 翻訳エラー。以下のログを確認してください。', voltar: '← 戻る',
  },
  'coreano': {
    titulo: '🔥 Campfire 번역기', selecionar: '+ 파일 선택',
    selecionarPasta: '+ 폴더 선택', traduzir: '번역하기 →',
    traduzindo: '⏳ 번역 중...', concluido: '✅ 완료! 폴더에서 생성된 파일을 확인하세요.',
    erro: '❌ 번역 오류. 아래 로그를 확인하세요.', voltar: '← 뒤로',
  },
  'chinês simplificado': {
    titulo: '🔥 Campfire 翻译器', selecionar: '+ 选择文件',
    selecionarPasta: '+ 选择文件夹', traduzir: '翻译 →',
    traduzindo: '⏳ 翻译中...', concluido: '✅ 完成！请查看文件夹中生成的文件。',
    erro: '❌ 翻译错误。请查看下方日志。', voltar: '← 返回',
  },
  'russo': {
    titulo: '🔥 Campfire Переводчик', selecionar: '+ Выбрать файл',
    selecionarPasta: '+ Выбрать папку', traduzir: 'Перевести →',
    traduzindo: '⏳ Перевод...', concluido: '✅ Готово! Проверьте созданные файлы в папке.',
    erro: '❌ Ошибка перевода. Смотрите журнал ниже.', voltar: '← Назад',
  },
  'árabe': {
    titulo: '🔥 Campfire مترجم', selecionar: '+ اختر ملفاً',
    selecionarPasta: '+ اختر مجلداً', traduzir: '→ ترجمة',
    traduzindo: '⏳ جارٍ الترجمة...', concluido: '✅ تم! تحقق من الملفات الناتجة في المجلد.',
    erro: '❌ خطأ في الترجمة. راجع السجل أدناه.', voltar: 'رجوع →',
  },
}

function parsearProgresso(logs) {
  let fase = '', pct = 0
  for (let i = logs.length - 1; i >= 0; i--) {
    const linha = logs[i]
    const blocoMatch = linha.match(/Bloco\s+(\d+)\s+varrido\s+\((\d+)MB\/(\d+)MB\)/)
    if (blocoMatch) {
      const atual = parseInt(blocoMatch[2]), total = parseInt(blocoMatch[3])
      const totalBlocos = Math.ceil(total / 5)
      fase = `Varrendo bloco ${blocoMatch[1]}/${totalBlocos} — ${atual}MB / ${total}MB`
      pct = Math.round((atual / total) * 40)
      return { fase, pct }
    }
    const batchMatch = linha.match(/Batch\s+(\d+)\/(\d+)/)
    if (batchMatch) {
      const atual = parseInt(batchMatch[1]), total = parseInt(batchMatch[2])
      fase = `Traduzindo... Batch ${atual} / ${total}`
      pct = 40 + Math.round((atual / total) * 50)
      return { fase, pct }
    }
    if (linha.includes('Aplicando traduções')) return { fase: 'Aplicando traduções...', pct: 92 }
    const parteMatch = linha.match(/Parte\s+(\d+)\/(\d+)/)
    if (parteMatch) {
      const atual = parseInt(parteMatch[1]), total = parseInt(parteMatch[2])
      fase = `Traduzindo parte ${atual} / ${total}`
      pct = Math.round((atual / total) * 90)
      return { fase, pct }
    }
    if (linha.includes('Copiando ISO')) return { fase: 'Copiando ISO...', pct: 3 }
  }
  return { fase: 'Processando...', pct: 1 }
}

export default function Tradutor({ modo, onVoltar }) {
  const [arquivo, setArquivo]           = useState(null)
  const [tipo, setTipo]                 = useState(null)
  const [idioma, setIdioma]             = useState(IDIOMAS[0].value)
  const [status, setStatus]             = useState('idle')
  const [logs, setLogs]                 = useState([])
  const [progressoSalvo, setProgressoSalvo] = useState(null)
  const logsEndRef = useRef(null)

  const t      = UI[idioma] || UI['português brasileiro coloquial']
  const isRTL  = idioma === 'árabe'
  const { fase, pct } = status === 'traduzindo' ? parsearProgresso(logs) : { fase: '', pct: 0 }

  useEffect(() => {
    window.api.onProgresso((msg) => {
      setLogs(prev => [...prev, msg.trim()])
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  // Verifica progresso salvo quando arquivo ou idioma muda
  useEffect(() => {
    async function verificar() {
      if (!arquivo || tipo !== 'arquivo') { setProgressoSalvo(null); return }
      const prog = await window.api.checkProgress(arquivo, idioma)
      setProgressoSalvo(prog)
    }
    verificar()
  }, [arquivo, idioma])

  async function selecionarArquivo() {
    const path = await window.api.selectFile(modo?.exts)
    if (path) { setArquivo(path); setTipo('arquivo'); setLogs([]); setStatus('idle'); setProgressoSalvo(null) }
  }

  async function selecionarPasta() {
    const path = await window.api.selectFolder()
    if (path) { setArquivo(path); setTipo('pasta'); setLogs([]); setStatus('idle'); setProgressoSalvo(null) }
  }

  async function descartarProgresso() {
    await window.api.clearProgress(arquivo, idioma)
    setProgressoSalvo(null)
  }

  async function traduzir() {
    if (!arquivo) return

    if (tipo === 'arquivo') {
      const info = await window.api.checkFileInfo(arquivo)
      const tamanhoMB = info.size / 1_000_000
      const extsCuidas = ['iso', 'bin', 'dat', 'rar', 'zip', 'nds', '3ds', 'nsp', 'xci']
      const ehGrande = tamanhoMB > 50
      const ehBinario = extsCuidas.includes(info.ext)

      if (ehGrande || ehBinario) {
        let msg = `⚠️ Atenção antes de continuar!\n\n`
        if (info.ext === 'iso') {
          msg += `Arquivos ISO podem ser muito grandes.\nTamanho: ${tamanhoMB.toFixed(0)}MB\n\nIsso pode demorar horas e consumir bastante crédito.\n\n`
        } else if (ehBinario) {
          msg += `Arquivos .${info.ext} podem conter muito texto a traduzir.\nTamanho: ${tamanhoMB.toFixed(0)}MB\n\nIsso pode consumir créditos dependendo do conteúdo.\n\n`
        } else {
          msg += `Arquivo grande detectado: ${tamanhoMB.toFixed(0)}MB\n\nA tradução pode demorar e consumir créditos.\n\n`
        }
        msg += `Deseja continuar mesmo assim?`
        if (!window.confirm(msg)) return
      }
    }

    setStatus('traduzindo')
    setLogs([])
    setProgressoSalvo(null)
    try {
      await window.api.traduzir(arquivo, idioma)
      setStatus('concluido')
    } catch (e) {
      setStatus('erro')
      // Recarrega o progresso salvo pra mostrar onde parou
      const prog = await window.api.checkProgress(arquivo, idioma)
      if (prog) setProgressoSalvo(prog)
    }
  }

  return (
    <div style={{ ...s.container, direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Cabeçalho */}
      <div style={s.cabecalho}>
        <button style={s.btnVoltar} onClick={onVoltar}>{t.voltar}</button>
        <span style={s.modoBadge}>{modo?.icone} {modo?.label}</span>
      </div>

      <h1 style={s.title}>{t.titulo}</h1>

      {modo?.aviso && <p style={s.avisoModo}>{modo.aviso}</p>}

      <div style={s.seletores}>
        <button style={s.btnSecundario} onClick={selecionarArquivo}>
          {tipo === 'arquivo' ? '📄 ' + arquivo.split('\\').pop() : t.selecionar}
        </button>
        <button style={s.btnSecundario} onClick={selecionarPasta}>
          {tipo === 'pasta' ? '📁 ' + arquivo.split('\\').pop() : t.selecionarPasta}
        </button>
      </div>

      {modo?.desc && <p style={s.extsAceitas}>Extensões aceitas: {modo.desc}</p>}

      <select style={s.select} value={idioma} onChange={e => { setIdioma(e.target.value); setStatus('idle') }}>
        {IDIOMAS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
      </select>

      {/* ── Banner de progresso salvo ──────────────────────────────────────── */}
      {progressoSalvo && status !== 'traduzindo' && (
        <div style={s.progressoBanner}>
          <div style={s.progressoBannerTopo}>
            <span style={s.progressoBannerIcone}>⏸️</span>
            <div>
              <p style={s.progressoBannerTitulo}>Tradução pausada encontrada</p>
              <p style={s.progressoBannerDesc}>
                {progressoSalvo.tipo === 'batch'
                  ? `Parou no batch ${progressoSalvo.atual} de ${progressoSalvo.total} (${progressoSalvo.pct}% concluído)`
                  : `Parou na parte ${progressoSalvo.atual} de ${progressoSalvo.total} (${progressoSalvo.pct}% concluído)`
                }
              </p>
              <p style={s.progressoBannerData}>
                {new Date(progressoSalvo.atualizado).toLocaleString()}
              </p>
            </div>
          </div>
          <div style={s.progressoBannerBotoes}>
            <button style={s.btnContinuar} onClick={traduzir}>
              ▶️ Continuar de onde parou
            </button>
            <button style={s.btnDescartar} onClick={descartarProgresso}>
              🗑️ Descartar e recomeçar
            </button>
          </div>
          {/* Barra de progresso do ponto onde parou */}
          <div style={s.progressoBar}>
            <div style={{ ...s.progressoFill, width: `${progressoSalvo.pct}%`, background: '#555' }} />
          </div>
        </div>
      )}

      {/* Botão traduzir normal (sem progresso salvo) */}
      {arquivo && status !== 'traduzindo' && !progressoSalvo && (
        <button style={s.btnPrimario} onClick={traduzir}>{t.traduzir}</button>
      )}

      {status === 'traduzindo' && (
        <div style={s.progressoWrap}>
          <div style={s.progressoTopo}>
            <span style={s.progressoFase}>{fase}</span>
            <span style={s.progressoPct}>{pct}%</span>
          </div>
          <div style={s.progressoBar}>
            <div style={{ ...s.progressoFill, width: `${pct}%` }} />
          </div>
        </div>
      )}

      {status === 'concluido' && <p style={s.sucesso}>{t.concluido}</p>}

      {status === 'erro' && (
        <div style={{ textAlign: 'center' }}>
          <p style={s.erro}>{t.erro}</p>
          {progressoSalvo && (
            <p style={{ color: '#f90', fontSize: 13 }}>
              💾 Progresso salvo! Quando tiver créditos disponíveis, selecione o mesmo arquivo e continue de onde parou.
            </p>
          )}
        </div>
      )}

      {logs.length > 0 && (
        <div style={s.logBox}>
          {logs.map((l, i) => <p key={i} style={s.logLinha}>{l}</p>)}
          <div ref={logsEndRef} />
        </div>
      )}
    </div>
  )
}

const s = {
  container: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', fontFamily:'sans-serif', background:'#1a1a1a', color:'#fff', gap:16, padding:32 },
  cabecalho: { display:'flex', alignItems:'center', justifyContent:'space-between', width:'100%', maxWidth:600, marginBottom:4 },
  btnVoltar: { background:'none', border:'1px solid #444', color:'#aaa', borderRadius:8, padding:'6px 14px', cursor:'pointer', fontSize:13 },
  modoBadge: { background:'#242424', border:'1px solid #333', borderRadius:8, padding:'4px 12px', fontSize:13, color:'#f90' },
  avisoModo: { color:'#f90', fontSize:13, background:'#242424', border:'1px solid #f90', borderRadius:8, padding:'8px 16px', maxWidth:500, textAlign:'center' },
  extsAceitas: { color:'#666', fontSize:12 },
  title: { fontSize:32, marginBottom:8 },
  seletores: { display:'flex', gap:8, flexWrap:'wrap', justifyContent:'center' },
  btnSecundario: { padding:'12px 24px', background:'#333', border:'1px solid #555', borderRadius:8, fontSize:15, cursor:'pointer', color:'#fff', maxWidth:260, wordBreak:'break-all' },
  select: { padding:'10px 16px', background:'#333', border:'1px solid #555', borderRadius:8, fontSize:15, color:'#fff', cursor:'pointer', width:280 },
  btnPrimario: { padding:'12px 32px', background:'#f90', border:'none', borderRadius:8, fontSize:16, cursor:'pointer', color:'#000', fontWeight:'bold' },

  // Banner de progresso salvo
  progressoBanner: { width:'100%', maxWidth:500, background:'#1e2a1e', border:'1px solid #3a5a3a', borderRadius:12, padding:16, display:'flex', flexDirection:'column', gap:12 },
  progressoBannerTopo: { display:'flex', gap:12, alignItems:'flex-start' },
  progressoBannerIcone: { fontSize:24 },
  progressoBannerTitulo: { color:'#4f4', fontWeight:'bold', fontSize:14, margin:0 },
  progressoBannerDesc: { color:'#aaa', fontSize:13, margin:'4px 0 0' },
  progressoBannerData: { color:'#555', fontSize:11, margin:'2px 0 0' },
  progressoBannerBotoes: { display:'flex', gap:8, flexWrap:'wrap' },
  btnContinuar: { flex:1, padding:'10px 16px', background:'#2a4a2a', border:'1px solid #4f4', borderRadius:8, color:'#4f4', cursor:'pointer', fontSize:14, fontWeight:'bold' },
  btnDescartar: { padding:'10px 16px', background:'none', border:'1px solid #555', borderRadius:8, color:'#888', cursor:'pointer', fontSize:13 },

  progressoWrap: { width:'100%', maxWidth:500, display:'flex', flexDirection:'column', gap:6 },
  progressoTopo: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  progressoFase: { fontSize:13, color:'#aaa' },
  progressoPct: { fontSize:13, color:'#f90', fontWeight:'bold' },
  progressoBar: { height:8, background:'#333', borderRadius:99, overflow:'hidden' },
  progressoFill: { height:'100%', background:'linear-gradient(90deg, #f90, #ffb700)', borderRadius:99, transition:'width 0.4s ease' },
  sucesso: { color:'#4f4' },
  erro: { color:'#f55' },
  logBox: { background:'#111', border:'1px solid #333', borderRadius:8, padding:16, width:'100%', maxWidth:600, maxHeight:200, overflowY:'auto', marginTop:8 },
  logLinha: { fontSize:13, color:'#aaa', margin:'2px 0', fontFamily:'monospace' },
}