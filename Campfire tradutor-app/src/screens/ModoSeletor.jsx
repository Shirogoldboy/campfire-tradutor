export const MODOS = [
  {
    id: 'texto',
    icone: '📄',
    label: 'Texto / Documento',
    desc: '.txt · .srt · .json · .xml · .csv · .epub',
    exts: ['.txt', '.srt', '.json', '.xml', '.csv', '.epub'],
    aviso: null,
  },
  {
    id: 'pdf',
    icone: '📕',
    label: 'PDF',
    desc: '.pdf',
    exts: ['.pdf'],
    aviso: null,
  },
  {
    id: 'imagem',
    icone: '🖼️',
    label: 'Imagem / Painel',
    desc: '.jpg · .jpeg · .png · .webp · .gif',
    exts: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    aviso: '📖 Extrai e traduz texto de imagens, mangá, HQs e screenshots usando Claude Vision.',
  },
  {
    id: 'audio',
    icone: '🎵',
    label: 'Áudio / Vídeo',
    desc: '.mp3 · .mp4 · .mkv',
    exts: ['.mp3', '.mp4', '.mkv'],
    aviso: 'Arquivos de áudio e vídeo usam Whisper para transcrição antes de traduzir.',
  },
  {
    id: 'jogos',
    icone: '🎮',
    label: 'Jogos',
    desc: '.iso · .bin · .dat · .nds · .3ds · .nsp · .xci',
    exts: ['.iso', '.bin', '.dat', '.nds', '.3ds', '.nsp', '.xci'],
    aviso: '⚠️ Arquivos de jogo podem ser grandes e consumir bastante crédito de API.',
  },
  {
    id: 'arquivo',
    icone: '📦',
    label: 'Arquivo Compactado',
    desc: '.zip · .rar',
    exts: ['.zip', '.rar'],
    aviso: null,
  },
]

export default function ModoSeletor({ onSelecionar }) {
  return (
    <div style={s.container}>
      <h1 style={s.titulo}>🔥 Campfire Tradutor</h1>
      <p style={s.sub}>Selecione o tipo de arquivo que deseja traduzir</p>

      <div style={s.grade}>
        {MODOS.map(modo => (
          <button key={modo.id} style={s.card} onClick={() => onSelecionar(modo)}>
            <span style={s.icone}>{modo.icone}</span>
            <span style={s.label}>{modo.label}</span>
            <span style={s.desc}>{modo.desc}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

const s = {
  container: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '100vh', fontFamily: 'sans-serif',
    background: '#1a1a1a', color: '#fff', gap: 24, padding: 32,
  },
  titulo: { fontSize: 32, marginBottom: 4 },
  sub: { color: '#aaa', marginBottom: 8, fontSize: 15 },
  grade: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 14, width: '100%', maxWidth: 700,
  },
  card: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
    padding: '24px 16px', background: '#242424', border: '1px solid #333',
    borderRadius: 14, cursor: 'pointer', color: '#fff', transition: 'border-color 0.2s',
    fontFamily: 'sans-serif',
  },
  icone: { fontSize: 36 },
  label: { fontSize: 15, fontWeight: 'bold' },
  desc: { fontSize: 12, color: '#888', textAlign: 'center' },
}