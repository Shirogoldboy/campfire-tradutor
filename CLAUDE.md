# Campfire Tradutor — Contexto Completo do Projeto

## Visão Geral
Aplicativo universal de tradução de arquivos desenvolvido por Caio Fabiano da Silva Costa (Shirogoldboy), dev solo brasileiro, sob a marca **"AlienRaccoon Entertainment"** (nome fantasia/estúdio, sem CNPJ ainda — decisão de 2026-08-06 de usar esse nome em tudo que for lançado daqui pra frente, incluindo o Campfire). Juridicamente, o Desenvolvedor/Licenciante nos documentos continua sendo Caio Fabiano da Silva Costa, pessoa física — "AlienRaccoon Entertainment" é citada como marca sob a qual ele atua, não como parte contratual (isso muda se/quando houver CNPJ). Disponível em Desktop (Windows) e Mobile (Android). O diferencial principal é um sistema de 3 camadas que democratiza o acesso à tradução, reduzindo progressivamente o consumo de tokens via dicionário colaborativo.

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

## Documentação Jurídica e Versionamento
- `Políticas/*.md` — versão **atual** de cada documento (Termos de Uso, EULA, Política de Privacidade, Política do Dicionário, Aviso de Direitos Autorais) + `.docx` prontos pra enviar ao advogado.
- `Políticas/Versões Jurídicas/<Nome do Documento>/vX.Y_*.md` — histórico imutável de cada versão (snapshot). Nunca editar um snapshot já criado — sempre gerar um novo arquivo pra próxima versão.
- `docs/*.md` — espelho da versão atual, preparado para GitHub Pages (Settings → Pages ainda não habilitado, aguardando confirmação).
- Convenção de versão (definida pelo advogado em 2026-07-16): **v0.1** Rascunho → **v0.2** Revisão Técnica (Claude) → **v0.3** Revisão Jurídica (advogado) → **v1.0** Publicação. Um documento só é considerado "congelado" depois da v0.3.

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
- Nintendo DS: container .nds próprio (parsear_nds_rom/remontar_nds_rom, substituindo o ndspy por questão de licença — ver Observações Importantes) + NARC parser/remontagem + BMG parser/remontagem + LZ10/LZ11
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

## Servidor Cloud (mobile — Arquivo Compactado)
Antes de 2026-08-06, o modo "Arquivo Compactado" (.zip/.rar) do app mobile só funcionava
com o servidor local (`server.py`) rodando no PC — exigia mandar o IP (ou um túnel tipo
ngrok) pra cada pessoa que fosse testar, e ficar com o PC ligado. Resolvido hospedando uma
versão restrita do servidor no Render (free tier): `https://campfire-tradutor.onrender.com`.
- `server.py` ganhou `CAMPFIRE_CLOUD_MODE=1` (setado via `ENV` no `Dockerfile`): restringe
  `MOBILE_EXTENSOES` a `{.zip, .rar}`, remove `.mkv/.mp4/.mp3` de `tradutor.EXTENSOES` antes
  de processar (evita o Whisper estourar os 512MB de RAM do free tier — áudio/vídeo dentro
  de um zip é simplesmente ignorado, sem quebrar o resto), e exige header `X-Campfire-Key`
  batendo com a env var `CAMPFIRE_ACCESS_KEY` do serviço (deterrente contra bots, não é
  segurança forte — a mesma chave está embutida em `campfire-mobile/App.js`).
- **Bug real corrigido nesse processo**: `processar_zip`/`processar_rar` em `tradutor.py`
  retornavam `(b'', '.zip_done')` — funcionava no desktop (a pasta de saída é aberta
  localmente) mas gerava um arquivo vazio no fluxo mobile/servidor, mesmo com o PC ligado.
  Agora repacotam a pasta de saída num zip em memória e retornam os bytes de verdade.
- Também corrigido: `EXIGE_CLAUDE` no servidor incluía `.zip`/`.rar`, bloqueando tradução
  sem chave Anthropic — mas cada arquivo interno já passa por `traduzir_lista()`, que tenta
  a camada gratuita primeiro. Removidos de `EXIGE_CLAUDE`. E o path hardcoded do Tesseract
  (`C:\Program Files\...`) virou condicional a `sys.platform == 'win32'`, pra não quebrar
  no container Linux.
- `Dockerfile` + `requirements-cloud.txt` na raiz de `Campfire tradutor-app/` — build não
  testado localmente (sem Docker no ambiente), validado direto no deploy do Render.
- Texto, PDF, imagem e áudio/vídeo **não** passam pelo servidor — o app mobile já processa
  esses direto (Claude/MyMemory/LibreTranslate client-side). Só ZIP/RAR dependia disso.
- App mobile (`campfire-mobile/App.js`): `CAMPFIRE_CLOUD_URL`/`CAMPFIRE_CLOUD_KEY` no topo do
  arquivo — usados por padrão; o campo manual "Servidor Próprio" no Setup continua existindo
  pra quem quiser apontar pro PC local ou um túnel (ngrok) no lugar do cloud.

## Como upar pro GitHub
```powershell
cd "C:\Users\Pichau\Documents\campfire projeto"
git add .
git commit -m "descrição"
git push
```

## Dependências Python principais
```
anthropic, python-dotenv, pdfplumber, fpdf, bs4
pycdlib, faster-whisper, rarfile, sqlite3, requests
langdetect, Pillow, ncompress, pdf2image, pytesseract
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
- [x] Opção no Setup pra desativar a contribuição automática ao dicionário colaborativo (2026-08-05) — checkbox em `Setup.jsx`, config `contribuirDicionario` em `main.js`, flag `_contribuir_dicionario` em `tradutor.py` (4º argumento de CLI)

### Fase Jurídica — acompanhamento com o advogado (Caio's mãe)
Estrutura por Etapas do 2º parecer jurídico (2026-07-16), que refina o plano de fases anterior.
Regra do advogado: **qualidade e consistência, não velocidade** — cada documento avança em
versões (v0.1 Rascunho → v0.2 Revisão Técnica → v0.3 Revisão Jurídica → v1.0 Publicação) e só
"congela" depois de passar pela revisão jurídica real. Histórico de cada documento fica em
`Políticas/Versões Jurídicas/<Nome do Documento>/`.

- [x] Etapa 1-4 — Levantamento técnico, arquitetura documentada, inventário de APIs, Memorial Técnico (=CLAUDE.md)
- [x] Etapa 5 — Primeiro rascunho dos 5 documentos jurídicos (Termos, EULA, Privacidade, Dicionário, Aviso)
- [x] **Etapa 5.1 — Revisão técnica dos Termos de Uso** (2026-07-16): `Políticas/termos_de_uso.md` agora em **v0.2**. Cláusulas de disponibilidade/suspensão do serviço, atualização do app, propriedade das contribuições (CC0), limitação de responsabilidade quanto a APIs de terceiros, e reconciliação entre a proibição de engenharia reversa e a licença MIT do código-fonte.
- [x] **Etapa 6 — Revisão técnica da EULA** (2026-07-16): `Políticas/eula.md` agora em **v0.2**. Nova Seção 1 (objeto/âmbito) e Seção 3 esclarecem que o EULA rege só o binário oficialmente distribuído, não o código-fonte MIT; nova Seção 7 protege a marca "Campfire Tradutor" separadamente do código (forks sob MIT não podem usar o nome/identidade visual).
- [x] **Etapa 7 — Revisão técnica da Política de Privacidade** (2026-07-16): `Políticas/politica_de_privacidade.md` agora em **v0.2**. Novas seções de Transferência Internacional de Dados (LGPD art. 33 — Anthropic/MyMemory/LibreTranslate/HuggingFace processam fora do Brasil) e Transferência de Titularidade. Nota [CONFIRMAR] sobre necessidade de Encarregado de Dados (DPO) formal.
- [x] **Etapa 8 — Revisão técnica da Política do Dicionário** (2026-07-16): `Políticas/politica_do_dicionario.md` agora em **v0.2**. Novas seções explicando quais traduções contribuem, quando um par é descartado/removido, e transparência (repositório público inspecionável por qualquer um) — sem revelar os critérios técnicos exatos.
- [x] **Etapa 9 — Revisão técnica do Aviso de Direitos Autorais** (2026-07-16): `Políticas/aviso_direitos_autorais.md` agora em **v0.2**. Adicionada via alternativa de notificação DMCA do GitHub e cláusula de lei aplicável/jurisdição.
- [x] **Revisão Jurídica da advogada incorporada em Termos de Uso, Política de Privacidade e Política do Dicionário (2026-08-06)**, agora todos em **v0.3**, alinhando-os com a EULA (já v0.3): `Políticas/termos_de_uso.md` ganhou Seção 11 (Controle de Exportação — sanções internacionais/regras de exportação de tecnologia de IA, responsabilidade do usuário) e Seção 12 (Uso por Pessoas Jurídicas — conformidade interna da empresa usuária), com renumeração das seções seguintes (13-15) e foro reformulado ("Fica com foro eleito..."); `Políticas/politica_de_privacidade.md` resolveu os dois colchetes pendentes (§2: confirmado que o app não usa SDKs de analytics/rastreamento; §4: dispensada a necessidade de DPO formal neste estágio); `Políticas/politica_do_dicionario.md` não teve alteração de conteúdo exigida pela advogada — sua única pendência para v1.0 (controle de opt-out da Seção 3) já estava implementada tecnicamente (Setup → "Dicionário Colaborativo"), então o v0.3 já reflete o texto final aguardando apenas a decisão de publicar oficialmente como v1.0 junto dos demais documentos. `docs/*.md`, snapshots em `Políticas/Versões Jurídicas/`, os `.docx` e `a revisar/` foram sincronizados.
- [ ] **Aviso de Direitos Autorais segue em v0.2** (a advogada não reenviou esse documento nesta rodada) — decidir se convém alinhá-lo a v0.3 antes da publicação v1.0 de todo o conjunto
- [x] Etapa 10 (busca preliminar, 2026-08-06) — Pesquisa informal na base pública do INPI (busca.inpi.gov.br/pePI, acesso anônimo). **"Campfire Tradutor" (nome completo, busca exata): 0 resultados.** Mas **"Campfire" sozinho tem 12 processos**, e as classes de software estão disputadas: Sapient Corporation tem registro ativo em vigor na Classe NCL 42 (desenvolvimento de software) desde 2014; Niantic Inc. tem designação Madri deferida na Classe 09 (software) desde 2021 — é o app "Campfire" deles, companion do Pokémon GO; Yousician Oy tentou Classes 09 e 42 em 2022 e foi **indeferido** nas duas; 37signals LLC tentou Classe 09 em 2023 e também foi **indeferido** (em recurso). **Conclusão: registrar só "Campfire" nas classes de software é arriscado — já indeferiram duas empresas grandes. "Campfire Tradutor" como nome composto não tem conflito direto, mas o INPI pode ainda assim negar por semelhança com as marcas "Campfire" ativas.** Isso é uma busca informal, não substitui parecer de um especialista em marcas — recomendo consultar um agente de propriedade industrial antes de protocolar, dado o histórico de indeferimentos na área de software.
- [ ] Etapa 11 — Pedido de registro da marca no INPI (~R$355)
- [ ] Etapa 12 — Registro do programa de computador no INPI (~R$80)
- [x] Nome completo (Caio Fabiano da Silva Costa), foro (Cabo de Santo Agostinho/PE) e modelo de negócio (freemium — EULA Seção 2) confirmados em 2026-08-05
- [x] Marca "AlienRaccoon Entertainment" adicionada em 2026-08-06 nos parágrafos de identificação do Desenvolvedor (Termos, EULA, Privacidade) — "Caio Fabiano da Silva Costa, pessoa física, atuando sob a marca [...]". Como isso toca o texto da EULA já revisada (v0.3) pela advogada, vale avisá-la dessa mudança específica antes da assinatura final, mesmo sem alterar a parte contratante.
- [x] **GitHub Pages no ar** (habilitado e confirmado em 2026-08-06, com autorização do Caio): `https://shirogoldboy.github.io/campfire-tradutor/` — os 5 documentos acessíveis (`/termos-de-uso`, `/eula`, `/politica-de-privacidade`, `/politica-do-dicionario`, `/aviso-direitos-autorais`). Nota técnica: o build automático às vezes fica "preso" em deployments cancelados quando dois pushes seguidos chegam rápido demais — se o site não atualizar sozinho em alguns minutos após um push, disparar manualmente com `gh api repos/Shirogoldboy/campfire-tradutor/pages/builds -X POST` resolve.
- [ ] Conformidade contínua: revisar termos das APIs de terceiros sempre que mudarem; revisar os documentos a cada nova funcionalidade relevante; atualizar antes de cada publicação (Play Store, novo domínio, etc.)

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
- **Análise de risco MyMemory sem contato formal com a Translated (decisão 2026-08-06):** os Termos deles não distinguem uso pessoal de comercial nem tratam explicitamente de apps distribuídos, então certeza jurídica total exigiria contato direto. Optou-se por não fazer esse contato por ora e aceitar o risco residual, com base em 3 pontos concretos: (1) arquitetura descentralizada — cada usuário chama a API do próprio dispositivo, não existe servidor central concentrando volume, então o app não se parece com um único consumidor comercial de alto volume; (2) `traduzir_com_mymemory()` só é chamada por segmento individual dentro de `traduzir_lista()` (nunca com texto concatenado/em bloco) — confirmado no código, e isso cumpre literalmente a regra deles de não "traduzir mais de um parágrafo de cada vez"; (3) falha graciosa já embutida — se o MyMemory bloquear/limitar o app por qualquer motivo, o código cai pro LibreTranslate e depois pro Claude automaticamente, sem quebrar nada. Reavaliar se o volume de uso crescer muito (ex: milhares de usuários simultâneos) ou antes de uma eventual monetização.
- **Achado jurídico 2026-08-05 (revisão de licenças de terceiros, pedida pelo advogado):** três dependências empacotadas no executável distribuído tinham licença copyleft forte, incompatível com o `LICENSE` MIT do repositório: `ndspy` (GPLv3+), `PyMuPDF`/fitz (AGPLv3) e `EbookLib` (AGPLv3).
  - `ndspy` **removido** — substituído por `parsear_nds_rom`/`remontar_nds_rom`, implementação própria a partir da especificação pública do formato .nds, testada e validada byte-a-byte contra o ndspy. Bônus: corrigiu um bug latente — `rom.filenames` do ndspy não era um dict de verdade e não suportava `.items()`, então a travessia de pastas em `processar_nds` provavelmente sempre falhava silenciosamente e caía no fallback binário.
  - `PyMuPDF`/fitz **removido** — substituído por `pdf2image` (MIT), que invoca o Poppler como processo externo (mesmo padrão do FFmpeg/Tesseract: instalado separadamente pelo usuário, nunca embutido no binário). Novo pré-requisito de instalação: Poppler (ver README).
  - `EbookLib` **removido** — substituído por leitura/escrita de EPUB própria em `processar_epub()`, usando só `zipfile` (stdlib) + `BeautifulSoup` (MIT, já dependência). Testado contra o EbookLib como referência: hierarquia de manifesto OPF, texto traduzido, imagens/CSS binários intactos byte-a-byte. Bônus: corrigiu dois bugs latentes de parsing — a declaração `<?xml ...?>` e o `<!DOCTYPE html>` vazavam como "texto" pro BeautifulSoup (via `html.parser`) e eram mandados pra tradução à toa; agora são filtrados corretamente.
  - **As três dependências copyleft foram removidas.** O `LICENSE` MIT do repositório volta a ser preciso para o binário distribuído.
- Pastas com espaço precisam de aspas nos comandos PowerShell
- Chave Anthropic começa com sk-ant-, 108 caracteres
- GITHUB_TOKEN nunca vai pro código — só no .env
- LZ10/LZ11 só é descomprimido dentro de processar_nds() — NUNCA em processar_binario() para evitar corrupção
- O algoritmo de validação/contribuição ao dicionário é o principal diferencial competitivo — não detalhar publicamente
- Tesseract instalado em: C:\Program Files\Tesseract-OCR\tesseract.exe
- Poppler precisa estar no PATH (`pdftoppm`) para o fallback de OCR de PDF escaneado funcionar — sem ele, `processar_pdf` só loga um aviso e segue sem OCR nessa página
- Fontes usadas no PDF: C:\Windows\Fonts\arial.ttf

## Preferências do Dev
- Código C# e Python com comentários explicativos em cada função
- Scripts completos quando há mudanças (não snippets isolados)
- Sempre lembrar de upar pro GitHub após sessões com muitas mudanças
- Confirmar antes de fazer mudanças permanentes
- Batchear atualizações do Notion ao invés de atualizar a cada decisão
