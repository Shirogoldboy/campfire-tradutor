# NOTICE — Componentes de Terceiros

O Campfire Tradutor (código-fonte sob licença MIT — ver `LICENSE`) incorpora as bibliotecas de
terceiros listadas abaixo. Cada uma permanece sob sua própria licença, listada aqui para fins de
atribuição e conformidade — ver [EULA](Políticas/eula.md), Seção 5 ("Componentes de Terceiros").

Verificado em 2026-08-05. Todas as licenças abaixo são permissivas (MIT, BSD, Apache-2.0, ISC,
domínio público) e compatíveis com a distribuição do binário sob os termos do EULA — nenhuma exige
relicenciamento do programa combinado.

## Desktop (Python)

| Biblioteca | Licença |
|---|---|
| anthropic | MIT |
| python-dotenv | BSD-3-Clause |
| pdfplumber (+ pdfminer.six) | MIT |
| fpdf2 | LGPL-3.0-or-later¹ |
| beautifulsoup4 (bs4) | MIT |
| pycdlib | LGPL-2.1-only¹ |
| faster-whisper | MIT |
| rarfile | ISC |
| requests | Apache-2.0 |
| langdetect | MIT |
| Pillow | MIT-CMU / HPND |
| ncompress | Domínio público |
| pdf2image | MIT |
| pytesseract | Apache-2.0 |
| qrcode | BSD |
| uvicorn | BSD-3-Clause |
| fastapi | MIT |
| python-docx | MIT |
| openpyxl | MIT |
| polib | MIT |

¹ **fpdf2 e pycdlib são LGPL** (mais branda que GPL/AGPL): permitem uso e distribuição dentro de um
programa com licença diferente (como o MIT deste projeto), desde que a própria biblioteca LGPL
continue disponível sob seus termos e sua origem seja atribuída — o que este documento cumpre.
Diferente de GPL/AGPL, a LGPL não exige que o programa inteiro adote a mesma licença.

## Desktop (Electron / JavaScript)

| Biblioteca | Licença |
|---|---|
| Electron | MIT |
| React | MIT |
| Vite | MIT |

## Mobile (Expo / React Native)

| Biblioteca | Licença |
|---|---|
| Expo SDK | MIT |
| React Native | MIT |
| @react-native-async-storage/async-storage | MIT |
| demais pacotes `expo-*` utilizados | MIT |

## Ferramentas externas (NÃO embutidas no binário)

As ferramentas abaixo são de licença GPL/LGPL, mas **não são distribuídas nem embutidas** pelo
Campfire Tradutor — o usuário as instala separadamente em seu próprio computador, e o Aplicativo
apenas as invoca como processos externos (subprocess), o mesmo princípio de "mera agregação" que
evita que a licença delas se estenda ao Aplicativo:

| Ferramenta | Licença | Uso |
|---|---|---|
| FFmpeg | GPL/LGPL (conforme build) | Extração de legendas de vídeo |
| Tesseract OCR | Apache-2.0 | OCR de PDFs escaneados |
| Poppler | GPL/LGPL (conforme build) | Renderização de páginas de PDF pro OCR (via `pdf2image`) |

## Histórico de conformidade

Em 2026-08-05, três dependências com licença copyleft forte — `ndspy` (GPLv3+), `PyMuPDF`/fitz
(AGPLv3) e `EbookLib` (AGPLv3) — foram **removidas e substituídas** por implementações próprias ou
alternativas permissivas, especificamente para que o `LICENSE` MIT do repositório seja preciso em
relação ao binário distribuído. Ver `CLAUDE.md`, seção "Observações Importantes", para detalhes
técnicos de cada substituição.
