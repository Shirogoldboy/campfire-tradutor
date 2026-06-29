import sys
import os
import re
import json
import time
import base64
import tempfile
import socket
import threading
import uvicorn
import requests
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse, JSONResponse

# ─── Carrega variáveis do .env ───────────────────────────────────────────────
load_dotenv()
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")
GITHUB_REPO  = os.getenv("GITHUB_REPO", "Shirogoldboy/campfire-dictionary")
GITHUB_API   = "https://api.github.com"

# Debug temporário
print(f"🔑 Token carregado: {'✅ SIM' if GITHUB_TOKEN else '❌ NÃO'}")
print(f"📦 Repo: {GITHUB_REPO}")

app = FastAPI()

MOBILE_EXTENSOES = {
    '.txt', '.srt', '.json', '.xml', '.csv',
    '.pdf', '.mkv', '.mp4', '.mp3', '.epub',
    '.zip', '.rar'
}

# Formatos que obrigatoriamente precisam do Claude
EXIGE_CLAUDE = {'.pdf', '.mkv', '.mp4', '.mp3', '.epub', '.zip', '.rar'}

# ─── Cache do dicionário em memória (TTL de 1 hora) ──────────────────────────
_dict_cache: dict = {}
CACHE_TTL = 3600

# ─── Normalização de idioma ───────────────────────────────────────────────────
def normalizar_idioma(idioma: str) -> str:
    """Converte strings human-readable de idioma pro código curto usado no dicionário."""
    idioma = idioma.lower()
    mapa = {
        "português": "ptbr", "portugues": "ptbr", "portuguese": "ptbr",
        "pt-br": "ptbr", "ptbr": "ptbr",
        "english": "en", "inglês": "en", "ingles": "en",
        "japanese": "ja", "japonês": "ja", "japones": "ja",
        "spanish": "es", "espanhol": "es",
        "french": "fr", "francês": "fr",
        "german": "de", "alemão": "de",
        "italian": "it", "italiano": "it",
        "chinese": "zh", "chinês": "zh",
        "korean": "ko", "coreano": "ko",
        "russian": "ru", "russo": "ru",
    }
    for key, code in mapa.items():
        if key in idioma:
            return code
    return idioma[:5].replace(" ", "")

def get_dict_key(idioma_origem: str, idioma_destino: str) -> str:
    """Gera o nome do arquivo JSON pro par de idiomas. Ex: en-ptbr"""
    return f"{normalizar_idioma(idioma_origem)}-{normalizar_idioma(idioma_destino)}"

# ─── Detecção de idioma de origem ────────────────────────────────────────────
def detectar_idioma(texto: str) -> str:
    """Detecta o idioma de um texto usando langdetect."""
    try:
        from langdetect import detect
        return detect(texto[:2000])
    except Exception:
        return "en"

# ─── Funções do dicionário GitHub ────────────────────────────────────────────
def fetch_dictionary(dict_key: str) -> dict:
    agora = time.time()
    if dict_key in _dict_cache:
        dados, timestamp = _dict_cache[dict_key]
        if agora - timestamp < CACHE_TTL:
            return dados

    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/contents/dictionary/{dict_key}.json"
    try:
        resp = requests.get(
            url,
            headers={"Accept": "application/vnd.github.v3.raw"},
            timeout=5
        )
        dados = resp.json() if resp.status_code == 200 else {}
    except Exception:
        dados = {}

    _dict_cache[dict_key] = (dados, agora)
    return dados

def _contribuir_background(dict_key: str, novas_traducoes: dict):
    if not GITHUB_TOKEN or not novas_traducoes:
        return

    url = f"{GITHUB_API}/repos/{GITHUB_REPO}/contents/dictionary/{dict_key}.json"
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }

    try:
        resp = requests.get(url, headers=headers, timeout=5)
        if resp.status_code == 200:
            atual = resp.json()
            conteudo_atual = json.loads(base64.b64decode(atual["content"]).decode("utf-8"))
            sha = atual["sha"]
        else:
            conteudo_atual = {}
            sha = None

        adicionados = 0
        for k, v in novas_traducoes.items():
            if k not in conteudo_atual:
                conteudo_atual[k] = v
                adicionados += 1

        if adicionados == 0:
            return

        conteudo_bytes = json.dumps(conteudo_atual, ensure_ascii=False, indent=2).encode("utf-8")
        payload = {
            "message": f"📖 Campfire: +{adicionados} traduções ({dict_key})",
            "content": base64.b64encode(conteudo_bytes).decode("utf-8")
        }
        if sha:
            payload["sha"] = sha

        r = requests.put(url, headers=headers, json=payload, timeout=10)
        print(f"📖 GitHub response: {r.status_code} - {r.json().get('message', 'ok')}")

        if dict_key in _dict_cache:
            dados, ts = _dict_cache[dict_key]
            dados.update({k: v for k, v in novas_traducoes.items() if k not in dados})
            _dict_cache[dict_key] = (dados, ts)

        print(f"📖 Dicionário atualizado: +{adicionados} traduções ({dict_key})")

    except Exception as e:
        print(f"⚠️ Erro ao contribuir pro dicionário: {e}")

def contribute_dictionary(dict_key: str, novas_traducoes: dict):
    thread = threading.Thread(
        target=_contribuir_background,
        args=(dict_key, novas_traducoes),
        daemon=True
    )
    thread.start()

# ─── Extração de segmentos por tipo de arquivo ───────────────────────────────
def extrair_segmentos_txt(conteudo: str) -> list:
    return [l.strip() for l in conteudo.splitlines() if l.strip()]

def extrair_segmentos_srt(conteudo: str) -> list:
    segmentos = []
    for linha in conteudo.splitlines():
        linha = linha.strip()
        if not linha or linha.isdigit() or re.match(r"\d{2}:\d{2}:\d{2}", linha):
            continue
        segmentos.append(linha)
    return segmentos

def extrair_pares_traducao(original: str, traduzido: str, ext: str) -> dict:
    if ext == '.txt':
        orig_segs = extrair_segmentos_txt(original)
        trad_segs = extrair_segmentos_txt(traduzido)
    elif ext == '.srt':
        orig_segs = extrair_segmentos_srt(original)
        trad_segs = extrair_segmentos_srt(traduzido)
    else:
        return {}

    pares = {}
    for o, t in zip(orig_segs, trad_segs):
        if o and t and o != t:
            pares[o] = t
    return pares

# ─── Rotas ───────────────────────────────────────────────────────────────────
@app.get("/status")
def status():
    return {"status": "ok", "campfire": "online"}

@app.post("/traduzir")
async def traduzir(
    arquivo: UploadFile = File(...),
    idioma: str = Form(default="português brasileiro coloquial"),
    api_key: str = Form(default="")
):
    ext = os.path.splitext(arquivo.filename)[1].lower()

    if ext not in MOBILE_EXTENSOES:
        return JSONResponse(
            status_code=400,
            content={"erro": f"Extensão '{ext}' não suportada no mobile."}
        )

    # Salva o arquivo recebido em temp
    temp_dir = tempfile.mkdtemp()
    temp_input = os.path.join(temp_dir, arquivo.filename)
    conteudo_original_bytes = await arquivo.read()

    with open(temp_input, 'wb') as f:
        f.write(conteudo_original_bytes)

    # Importa o tradutor
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    import tradutor as t

    # ── Inicializa Claude se tiver chave — sem chave = modo gratuito ──────────
    if api_key:
        t.inicializar_cliente(api_key)
    elif os.environ.get("ANTHROPIC_API_KEY"):
        t.inicializar_cliente()
    # else: client permanece None (modo gratuito via MyMemory/LibreTranslate)

    # ── Formatos que exigem Claude — sem chave retorna erro estruturado ───────
    if not api_key and not os.environ.get("ANTHROPIC_API_KEY") and ext in EXIGE_CLAUDE:
        return JSONResponse(status_code=402, content={
            "erro": "CLAUDE_NECESSARIO",
            "motivo": f"O formato {ext} requer IA avançada. Adicione sua chave Anthropic nas configurações."
        })

    t._idioma_global = idioma

    try:
        handler = t.EXTENSOES.get(ext)
        if not handler:
            return JSONResponse(status_code=400, content={"erro": "Extensão não suportada."})

        conteudo, ext_saida = handler(temp_input)

        nome_base = os.path.splitext(arquivo.filename)[0]
        nome_saida = f"{nome_base}_traduzido{ext_saida}"
        temp_output = os.path.join(temp_dir, nome_saida)

        if isinstance(conteudo, bytes):
            with open(temp_output, 'wb') as f: f.write(conteudo)
        else:
            with open(temp_output, 'w', encoding='utf-8') as f: f.write(conteudo)

        # ─── Contribuição pro dicionário ──────────────────────────────────────
        if ext in ('.txt', '.srt') and isinstance(conteudo, str):
            try:
                conteudo_original_str = conteudo_original_bytes.decode('utf-8', errors='ignore')
                idioma_origem         = detectar_idioma(conteudo_original_str)
                dict_key              = get_dict_key(idioma_origem, idioma)
                pares                 = extrair_pares_traducao(conteudo_original_str, conteudo, ext)
                if pares:
                    contribute_dictionary(dict_key, pares)
            except Exception as e:
                print(f"⚠️ Erro na contribuição do dicionário: {e}")

        return FileResponse(
            temp_output,
            filename=nome_saida,
            media_type='application/octet-stream'
        )

    except Exception as e:
        erro_str = str(e)
        # ── Erro estruturado quando Claude é necessário mas não disponível ────
        if "CLAUDE_NECESSARIO" in erro_str:
            return JSONResponse(status_code=402, content={
                "erro": "CLAUDE_NECESSARIO",
                "motivo": erro_str.replace("CLAUDE_NECESSARIO: ", "")
            })
        return JSONResponse(status_code=500, content={"erro": erro_str})

    finally:
        pass

if __name__ == "__main__":

    def get_wifi_ip():
        try:
            s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
            s.connect(("8.8.8.8", 80))
            ip = s.getsockname()[0]
            s.close()
            return ip
        except:
            return socket.gethostbyname(socket.gethostname())

    ip = get_wifi_ip()
    print(f"\n🔥 Campfire Server rodando em:")
    print(f"   http://{ip}:8000")
    print(f"\n📱 Use esse IP no app mobile!\n")

    # ── Gera QR Code pra conectar o mobile ───────────────────────────────────
    try:
        import qrcode as _qr
        print("📷 Escaneie com o app Campfire Mobile:\n")
        qr = _qr.QRCode(border=1)
        qr.add_data(ip)
        qr.make(fit=True)
        qr.print_ascii(invert=True)
        img = qr.make_image(fill_color="black", back_color="white")
        img.save("campfire_qr.png")
        print(f"\n💾 QR salvo em campfire_qr.png\n")
    except Exception as e:
        print(f"⚠️ QR não disponível: {e}\n")

    uvicorn.run(app, host="0.0.0.0", port=8000)