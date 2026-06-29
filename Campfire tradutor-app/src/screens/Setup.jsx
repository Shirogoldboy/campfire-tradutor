import { useState, useEffect } from 'react'

export default function Setup({ onPronto }) {
  const [deps, setDeps] = useState(null)
  const [apiKey, setApiKey] = useState('')
  const [apiKeySalva, setApiKeySalva] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [mostrarGuia, setMostrarGuia] = useState(false)

  useEffect(() => {
    window.api.checkDeps().then(setDeps)
    window.api.loadApiKey().then(k => { if (k) setApiKeySalva(k) })
  }, [])

  const depsFaltando = deps && (!deps.python || !deps.ffmpeg)
  const tudoOk = deps?.python && deps?.ffmpeg && apiKeySalva

  async function salvar() {
    if (!apiKey.startsWith('sk-ant-')) {
      alert('Chave inválida. Deve começar com sk-ant-')
      return
    }
    setSalvando(true)
    await window.api.saveApiKey(apiKey)
    setApiKeySalva(apiKey)
    setApiKey('')
    setSalvando(false)
  }

  return (
    <div style={s.container}>
      <h1 style={s.title}>🔥 Campfire Tradutor</h1>
      <p style={s.sub}>Configure o app uma vez e pronto.</p>

      <div style={s.card}>
        <p style={s.cardTitulo}>1. Dependências</p>
        {!deps && <p style={s.info}>Verificando...</p>}
        {deps && (
          <>
            <Item nome="Python" ok={deps.python} link="https://python.org/downloads" onLink={window.api.openUrl} />
            <Item nome="FFmpeg" ok={deps.ffmpeg} link="https://ffmpeg.org/download.html" onLink={window.api.openUrl} />
          </>
        )}
      </div>

      <div style={s.card}>
        <p style={s.cardTitulo}>2. Chave de API Anthropic</p>

        {apiKeySalva ? (
          <div style={s.keyOk}>
            <span>✅ Chave configurada</span>
            <button style={s.btnTrocaKey} onClick={() => setApiKeySalva(null)}>Trocar</button>
          </div>
        ) : (
          <>
            <p style={s.info}>A chave é necessária para as traduções. Cada usuário usa a própria.</p>
            <button style={s.btnGuia} onClick={() => setMostrarGuia(!mostrarGuia)}>
              {mostrarGuia ? '▲ Fechar guia' : '▼ Como obter minha chave?'}
            </button>

            {mostrarGuia && (
              <div style={s.guia}>
                <p style={s.passo}>1. Crie uma conta gratuita em:</p>
                <button style={s.btnLink} onClick={() => window.api.openUrl('https://console.anthropic.com')}>
                  → Abrir console.anthropic.com
                </button>
                <p style={s.passo}>2. Vá em <b>Billing → Add Credits</b> e adicione U$5 (~R$28). Esse valor dura bastante para uso normal.</p>
                <p style={s.passo}>3. Vá em <b>API Keys → Create Key</b>, dê um nome qualquer e copie a chave.</p>
                <p style={s.passo}>4. Cole a chave aqui abaixo e clique em Salvar.</p>
                <p style={s.aviso}>⚠️ Guarde sua chave em local seguro. Ela começa com <b>sk-ant-</b></p>
              </div>
            )}

            <div style={s.inputRow}>
              <input
                style={s.input}
                type="password"
                placeholder="sk-ant-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
              />
              <button style={s.btnSalvar} onClick={salvar} disabled={salvando || !apiKey}>
                {salvando ? '...' : 'Salvar'}
              </button>
            </div>
          </>
        )}
      </div>

      {depsFaltando && (
        <p style={s.erro}>Instale as dependências faltantes e reinicie o app.</p>
      )}

      {tudoOk && (
        <button style={s.btnEntrar} onClick={onPronto}>Entrar no app →</button>
      )}
    </div>
  )
}

function Item({ nome, ok, link, onLink }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
      <span style={{ fontSize: 16 }}>{ok ? '✅' : '❌'} {nome}</span>
      {!ok && <button style={{ background: 'none', border: '1px solid #f90', color: '#f90', borderRadius: 6, padding: '2px 10px', cursor: 'pointer', fontSize: 13 }} onClick={() => onLink(link)}>Baixar</button>}
    </div>
  )
}

const s = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif', background: '#1a1a1a', color: '#fff', gap: 16, padding: 32 },
  title: { fontSize: 32, marginBottom: 4 },
  sub: { color: '#aaa', marginBottom: 8 },
  card: { background: '#242424', border: '1px solid #333', borderRadius: 12, padding: '18px 24px', width: '100%', maxWidth: 480 },
  cardTitulo: { fontWeight: 'bold', marginBottom: 12, fontSize: 15, color: '#f90' },
  info: { color: '#aaa', fontSize: 13, marginBottom: 8 },
  guia: { background: '#1a1a1a', borderRadius: 8, padding: 14, marginTop: 10, marginBottom: 10 },
  passo: { fontSize: 13, color: '#ccc', margin: '6px 0' },
  aviso: { fontSize: 12, color: '#f90', marginTop: 8 },
  btnGuia: { background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: 13, padding: '4px 0', marginBottom: 4 },
  btnLink: { background: '#333', border: '1px solid #555', color: '#fff', borderRadius: 6, padding: '6px 14px', cursor: 'pointer', fontSize: 13, marginBottom: 8, display: 'block' },
  inputRow: { display: 'flex', gap: 8, marginTop: 10 },
  input: { flex: 1, padding: '8px 12px', background: '#333', border: '1px solid #555', borderRadius: 8, color: '#fff', fontSize: 14, fontFamily: 'monospace' },
  btnSalvar: { padding: '8px 18px', background: '#f90', border: 'none', borderRadius: 8, color: '#000', fontWeight: 'bold', cursor: 'pointer', fontSize: 14 },
  keyOk: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  btnTrocaKey: { background: 'none', border: '1px solid #555', color: '#aaa', borderRadius: 6, padding: '3px 10px', cursor: 'pointer', fontSize: 12 },
  btnEntrar: { padding: '12px 36px', background: '#f90', border: 'none', borderRadius: 8, fontSize: 16, cursor: 'pointer', color: '#000', fontWeight: 'bold', marginTop: 8 },
  erro: { color: '#f55', fontSize: 13 },
}