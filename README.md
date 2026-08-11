# 🔥 Campfire Tradutor

Aplicativo universal de tradução de arquivos usando IA. Disponível para **Windows** (desktop) e **Android** (mobile).

> Este repositório contém apenas os binários compilados e os documentos legais do projeto. O código-fonte não é público.

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
| 📄 Texto / Documento | `.txt` `.srt` `.json` `.xml` `.csv` `.epub` `.docx` `.xlsx` | Não (gratuito) |
| 🌐 Localização de software | `.po` `.strings` `.resx` | Não (gratuito) |
| 📕 PDF | `.pdf` | Sim |
| 🖼️ Imagem / Painel | `.jpg` `.jpeg` `.png` `.webp` | Sim (Claude Vision) |
| 🎵 Áudio / Vídeo | `.mp3` `.mp4` `.mkv` | Sim |
| 🎮 Jogos | `.iso` `.bin` `.dat` `.nds` `.3ds` `.nsp` `.xci` | Sim |
| 📦 Compactados | `.zip` `.rar` | Sim (via servidor cloud, gratuito) |

---

## 🖥️ Desktop (Windows)

Baixe o instalador na aba [Releases](https://github.com/Shirogoldboy/campfire-tradutor/releases) e execute o `.exe`.

## 📱 Mobile (Android)

Baixe o `.apk` na aba [Releases](https://github.com/Shirogoldboy/campfire-tradutor/releases) e instale no aparelho (pode ser necessário permitir instalação de fontes desconhecidas nas configurações do Android).

---

## 📖 Dicionário Colaborativo

Toda tradução feita no Campfire contribui automaticamente para o dicionário público:

👉 [github.com/Shirogoldboy/campfire-dictionary](https://github.com/Shirogoldboy/campfire-dictionary)

- Público e open source
- Organizado por par de idiomas (`en-ptbr.json`, `ja-ptbr.json`, etc.)
- Backup automático diário

---

## 📜 Documentos Legais

- [Termos de Uso](https://shirogoldboy.github.io/campfire-tradutor/termos-de-uso)
- [Política de Privacidade](https://shirogoldboy.github.io/campfire-tradutor/politica-de-privacidade)
- [EULA](https://shirogoldboy.github.io/campfire-tradutor/eula)
- [Política do Dicionário Colaborativo](https://shirogoldboy.github.io/campfire-tradutor/politica-do-dicionario)
- [Aviso de Direitos Autorais](https://shirogoldboy.github.io/campfire-tradutor/aviso-direitos-autorais)

---

## 🛠️ Tecnologias

**Desktop:** Electron · React · Vite · Python · FastAPI · PyInstaller
**Mobile:** Expo · React Native · EAS Build
**IA:** Anthropic Claude (Haiku) · faster-whisper · Tesseract OCR · Claude Vision
**Tradução gratuita:** MyMemory · LibreTranslate

---

## 📬 Contato

alienraccoonentertainment@gmail.com

---

*Campfire Tradutor — tradução universal, dicionário colaborativo*
