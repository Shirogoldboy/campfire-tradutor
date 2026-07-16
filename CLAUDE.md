# Campfire Tradutor — Contexto Completo do Projeto

## Visão Geral
Aplicativo universal de tradução de arquivos desenvolvido por Caio (Shirogoldboy), dev solo brasileiro. Disponível em Desktop (Windows) e Mobile (Android). O diferencial principal é um sistema de 3 camadas que democratiza o acesso à tradução, reduzindo progressivamente o consumo de tokens via dicionário colaborativo.

## Repositórios
- App: github.com/Shirogoldboy/campfire-tradutor
- Dicionário: github.com/Shirogoldboy/campfire-dictionary (público, open source)

## Estrutura de Pastas
```
C:\Users\Pichau\Documents\campfire projeto
├── Campfire tradutor-app\ # Desktop (Electron + React + Vite + Python)
│ ├── src\screens\ # Telas React (Tradutor.jsx, Setup.jsx, ModoSeletor.jsx)
│ ├── electron\ # main.js, preload.js
│ ├── tradutor.py # Motor de tradução Python (arquivo principal)
│ ├── server.py # Servidor FastAPI para comunicação mobile
│ ├── tradutor.spec # Spec do PyInstaller
│ └── .env # GITHUB_TOKEN + GITHUB_REPO (nunca expor)
└── campfire-mobile\ # Mobile (Expo/React Native)
└── App.js # App completo (único arquivo principal)
```

## Stack Tecnológico
**Desktop:** Electron 42 + React + Vite + Python 3.14 + FastAPI + PyInstaller
**Mobile:** Expo + React Native + EAS Build (package: com.campfire.tradutor)
**IA:** Claude Haiku (anthropic), Whisper (faster-whisper local + HuggingFace API)
**Tradução gratuita:** MyMemory API + LibreTranslate (servidores públicos)
**Dicionário:** GitHub REST API + JSON por par de idiomas
**OCR:** Tesseract (C:\Program Files\Tesseract-OCR\tesseract.exe) + PyMuPDF
**Áudio mobile:** expo-speech-recognition (gravação ao vivo) + HuggingFace Whisper (arquivo)
**PDF mobile:** pdfjs-dist/legacy

## Sistema de 3 Camadas (núcleo do projeto)
```
Texto para traduzir
↓
1. Dicionário GitHub (gratuito, cache 1h)
↓ não encontrou
2. MyMemory → LibreTranslate (gratuito)
↓ qualidade suspeita ou falhou
3. Claude Haiku (gasta tokens)
↓
Avaliação automática de qualidade (sem tokens)
↓ se Claude foi usado
Claude valida antes de contribuir ao dicionário
↓
Contribuição assíncrona ao dicionário (background thread)
```

## Formatos Suportados

### Desktop
- Texto: .txt .srt .json .xml .csv .epub .docx .xlsx
- Localização de software: .po .strings .resx
- PDF: pdfplumber + Tesseract OCR fallback
- Imagens: Claude Vision + Pillow anotação (.jpg .jpeg .png .webp .gif)
- Áudio/Vídeo: faster-whisper → Claude (.mp3 .mp4 .mkv)
- Binários: varredura 8bit/16bit/ShiftJIS/EUC-JP (.bin .dat)
- ISO: pycdlib + raw scan chunks 5MB
- Compactados: zipfile + rarfile (.zip .rar)
- Nintendo DS: ndspy + NARC parser/remontagem + BMG parser/remontagem + LZ10/LZ11
- Nintendo 3DS/Switch: SARC parser/remontagem + MSBT parser/remontagem

### Mobile (sem PC)
- Texto direto: .txt .srt .json .xml .csv (gratuito, sem chave)
- PDF direto: pdfjs-dist extrai texto → tradução gratuita (PDF escaneado → onboarding)
- Imagem: Claude Vision direto (precisa de chave)
- Áudio arquivo: HuggingFace Whisper → fallback Claude (precisa de token HF ou chave)
- Gravação ao vivo: expo-speech-recognition (Google Speech nativo, 100% grátis)
- Compactados: requer servidor PC

## Funcionalidades Implementadas
- [x] Progresso salvo em %AppData%/Campfire Tradutor/progress/{hash}.json
- [x] QR Code gerado pelo server.py para conexão mobile sem digitar IP
- [x] Modo gratuito sem chave API (MyMemory + LibreTranslate)
- [x] Tela de onboarding quando Claude é necessário mas sem chave
- [x] Dicionário colaborativo com contribuição automática em background
- [x] Cache SQLite local de traduções
- [x] GitHub Actions: backup automático diário dos dois repositórios
- [x] Interface multilíngue (12 idiomas)
- [x] Detecção automática de idioma de origem (langdetect)
- [x] Tradução paralela em batches (5 threads)
- [x] Avaliação de qualidade sem gastar tokens
- [x] Token HuggingFace configurável no setup mobile
- [x] Ícone novo (fogueira azul) em todos os formatos

## Como Buildar

### Desktop
```powershell
cd "C:\Users\Pichau\Documents\campfire projeto\Campfire tradutor-app"
npm run build
# Gera: dist\Campfire Tradutor Setup 1.0.0.exe
```

### Mobile APK
```powershell
cd "C:\Users\Pichau\Documents\campfire projeto\campfire-mobile"
eas build -p android --profile preview
```

### Rodar em desenvolvimento
```powershell
# Desktop
cd "C:\Users\Pichau\Documents\campfire projeto\Campfire tradutor-app"
npm run start

# Servidor mobile
python server.py
```

## Como upar pro GitHub
```powershell
cd "C:\Users\Pichau\Documents\campfire projeto"
git add .
git commit -m "descrição"
git push
```

## Dependências Python principais
```
anthropic, python-dotenv, pdfplumber, fpdf, ebooklib, bs4
pycdlib, faster-whisper, rarfile, sqlite3, requests
langdetect, Pillow, ndspy, ncompress, pymupdf, pytesseract
qrcode[pil], uvicorn, fastapi
python-docx, openpyxl, polib
```

## Dependências Mobile principais
```
expo-document-picker, expo-file-system, expo-sharing
@react-native-async-storage/async-storage
expo-camera, expo-speech-recognition, expo-av
pdfjs-dist, expo-build-properties
```

## Variáveis de Ambiente (.env — nunca expor)
- GITHUB_TOKEN: token do dev para escrever no dicionário colaborativo
- GITHUB_REPO: Shirogoldboy/campfire-dictionary

## Roadmap Pendente

### Curto prazo (produto)
- [x] Suporte a DOCX (python-docx) — `processar_docx()` em tradutor.py
- [x] Suporte a XLSX/planilhas (openpyxl) — `processar_xlsx()` em tradutor.py
- [x] Suporte a arquivos i18n (.po, .strings, .resx) — `processar_po()`, `processar_strings()`, `processar_resx()`
- [ ] Play Store (R$130 taxa única — requer 12 testadores por 14 dias) — pagamento e conta de dev ficam por conta do Caio
- [ ] Adicionar opção no Setup pra desativar a contribuição automática ao dicionário colaborativo (recomendação do advogado — dá ao usuário controle sobre o que é compartilhado)

### Fase Jurídica — acompanhamento com o advogado (Caio's mãe)
Ordem sugerida pelo parecer jurídico de 2026-07-16:

**Fase 1 — Documentação jurídica**
- [x] Termos de Uso — `Políticas/termos_de_uso.md` + `docs/termos-de-uso.md`
- [x] EULA — `Políticas/eula.md` + `docs/eula.md`
- [x] Política de Privacidade — `Políticas/politica_de_privacidade.md` + `docs/politica-de-privacidade.md`
- [x] Política do Dicionário Colaborativo — `Políticas/politica_do_dicionario.md` + `docs/politica-do-dicionario.md`
- [x] Aviso de Direitos Autorais — `Políticas/aviso_direitos_autorais.md` + `docs/aviso-direitos-autorais.md`
- [ ] Revisão final do advogado + preencher campos pendentes: sobrenome completo do Caio, cidade/comarca (foro), licença do repositório (ex: MIT/GPL/CC0), data de vigência
- [ ] Publicar via GitHub Pages (`docs/` já preparado — falta habilitar Settings → Pages e confirmar antes de ir ao ar)

**Fase 2 — Propriedade intelectual**
- [ ] Busca oficial de anterioridade da marca "Campfire Tradutor" no INPI
- [ ] Pedido de registro da marca no INPI (~R$355)
- [ ] Registro do programa de computador no INPI (~R$80)

**Fase 3 — Conformidade contínua**
- [ ] Revisar termos das APIs de terceiros (MyMemory, Anthropic, Hugging Face) sempre que eles mudarem
- [ ] Revisar os documentos legais a cada nova funcionalidade relevante (ex: DOCX/XLSX já cobertos; repetir quando publicidade, contas ou servidor próprio entrarem em cena)
- [ ] Atualizar a documentação antes de cada publicação relevante (Play Store, novo domínio, etc.)

### Médio prazo (produto)
- [ ] Pipeline de áudio aprimorado (tudo via Claude, sem Whisper local)
- [ ] Modo lote de imagens (mangá completo)

### Longo prazo (produto)
- [ ] Servidor próprio (modelo freemium via Pix/cartão) — pagamentos ficam pra depois
- [ ] iOS (Apple Developer: $99/ano) — pagamento fica pra depois
- [ ] PPTX (apresentações)
- [ ] Tradução de código-fonte (.po, .resx, arquivos i18n avançados)
- [ ] Modo colaborativo (equipes compartilhando dicionário privado)

## Observações Importantes
- O sistema de 3 camadas (dicionário → gratuito → Claude), internamente chamado de **Campfire Smart Dictionary** [nome sugerido pelo advogado, ajustar se preferir outro], estava com a camada gratuita (MyMemory/LibreTranslate) implementada mas **desconectada** de `traduzir_lista()` até 2026-07-16 — todo texto novo ia direto pro Claude. Corrigido: `traduzir_lista()` agora tenta a camada gratuita por segmento antes de batchear o restante pro Claude.
- **Importante (achado jurídico 2026-07-16):** os Termos do MyMemory proíbem republicar sua "Public Data" (segmentos crus) em outro repositório. Por isso, **só traduções geradas pelo Claude são contribuídas ao dicionário colaborativo público** — traduções do MyMemory/LibreTranslate são usadas apenas no resultado do próprio usuário, nunca enviadas pra `contribute_dictionary()`. Ver `Políticas/politica_de_privacidade.md` seção 1.3 e `Políticas/politica_do_dicionario.md` seção 2.
- Pastas com espaço precisam de aspas nos comandos PowerShell
- Chave Anthropic começa com sk-ant-, 108 caracteres
- GITHUB_TOKEN nunca vai pro código — só no .env
- LZ10/LZ11 só é descomprimido dentro de processar_nds() — NUNCA em processar_binario() para evitar corrupção
- O algoritmo de validação/contribuição ao dicionário é o principal diferencial competitivo — não detalhar publicamente
- Tesseract instalado em: C:\Program Files\Tesseract-OCR\tesseract.exe
- Fontes usadas no PDF: C:\Windows\Fonts\arial.ttf

## Preferências do Dev
- Código C# e Python com comentários explicativos em cada função
- Scripts completos quando há mudanças (não snippets isolados)
- Sempre lembrar de upar pro GitHub após sessões com muitas mudanças
- Confirmar antes de fazer mudanças permanentes
- Batchear atualizações do Notion ao invés de atualizar a cada decisão
