# 🔥 Campfire Tradutor

Aplicativo universal de tradução de arquivos usando IA. Disponível para **Windows** (desktop) e **Android** (mobile).

## ✨ Como funciona

O Campfire usa um sistema de três camadas pra democratizar o acesso à tradução:

1. **Dicionário colaborativo** — segmentos já traduzidos pela comunidade são reutilizados gratuitamente
2. **Tradução gratuita** — MyMemory e LibreTranslate cobrem o que não está no dicionário
3. **Claude (Anthropic)** — usado apenas quando necessário, com a chave do próprio usuário

> Quanto mais pessoas usam, mais rico o dicionário fica — e menos crédito todos gastam.

---

## 📦 Formatos suportados

| Modo | Extensões | Requer chave? |
|---|---|---|
| 📄 Texto / Documento | `.txt` `.srt` `.json` `.xml` `.csv` `.epub` | Não (gratuito) |
| 📕 PDF | `.pdf` | Sim |
| 🖼️ Imagem / Painel | `.jpg` `.jpeg` `.png` `.webp` | Sim (Claude Vision) |
| 🎵 Áudio / Vídeo | `.mp3` `.mp4` `.mkv` | Sim |
| 🎮 Jogos | `.iso` `.bin` `.dat` `.nds` `.3ds` `.nsp` `.xci` | Sim |
| 📦 Compactados | `.zip` `.rar` | Sim |

---

## 🖥️ Desktop (Windows)

### Instalação
Baixe o instalador na aba [Releases](https://github.com/Shirogoldboy/campfire-tradutor/releases).

### Dependências
- [Python 3.x](https://python.org/downloads)
- [FFmpeg](https://ffmpeg.org/download.html) (para áudio/vídeo)
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (para PDFs escaneados)

### Como usar
1. Instale o `Campfire Tradutor Setup 1.0.0.exe`
2. Abra o app e configure sua chave Anthropic (opcional — necessária só pra formatos avançados)
3. Selecione o modo de tradução
4. Selecione o arquivo e traduz!

---

## 📱 Mobile (Android)

O app mobile se conecta ao servidor Python rodando no PC via WiFi.

### Como usar
1. Instale o APK no Android
2. No PC, rode: `python server.py` na pasta `Campfire tradutor-app`
3. Escaneie o QR Code exibido no terminal com o app
4. Selecione o modo e traduza!

> Arquivos de texto (`.txt`, `.srt`, `.json`) funcionam **sem servidor** e **sem chave API** — direto no celular via tradução gratuita.

---

## 📖 Dicionário Colaborativo

Toda tradução feita no Campfire contribui automaticamente para o dicionário público:

👉 [github.com/Shirogoldboy/campfire-dictionary](https://github.com/Shirogoldboy/campfire-dictionary)

- Público e open source
- Organizado por par de idiomas (`en-ptbr.json`, `ja-ptbr.json`, etc.)
- Backup automático diário

---

## 🗺️ Roadmap

- [ ] Play Store
- [ ] Pipeline de áudio aprimorado (tudo via Claude)
- [ ] Servidor próprio (modelo freemium)
- [ ] Suporte iOS

---

## 📋 Estrutura do projeto

campfire projeto/
├── Campfire tradutor-app/   # Desktop (Electron + React + Python)
│   ├── src/                 # Interface React
│   ├── electron/            # Main process
│   ├── tradutor.py          # Motor de tradução Python
│   └── server.py            # Servidor FastAPI (mobile)
└── campfire-mobile/         # Mobile (Expo/React Native)
└── App.js               # App principal


---

## 🛠️ Tecnologias

**Desktop:** Electron · React · Vite · Python · FastAPI · PyInstaller  
**Mobile:** Expo · React Native · EAS Build  
**IA:** Anthropic Claude (Haiku) · faster-whisper · Tesseract OCR · Claude Vision  
**Tradução gratuita:** MyMemory · LibreTranslate  
**Formatos Nintendo:** ndspy · NARC · BMG · MSBT · SARC · LZ10/LZ11

---

*Campfire Tradutor — tradução universal, dicionário colaborativo* 
