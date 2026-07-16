# -*- mode: python ; coding: utf-8 -*-

a = Analysis(
    ['tradutor.py'],
    pathex=[],
    binaries=[],
    datas=[],
    hiddenimports=[
    'anthropic', 'dotenv', 'pdfplumber', 'fpdf',
    'ebooklib', 'bs4', 'pycdlib', 'faster_whisper',
    'docx', 'docx.oxml', 'lxml', 'lxml.etree',
    'openpyxl',
    'polib',
    'xml.etree.ElementTree',
    'rarfile', 'sqlite3', 'hashlib', 'concurrent.futures',
    'pydantic', 'httpx', 'anyio', 'certifi',
    'requests', 'requests.adapters', 'requests.auth',
    'langdetect', 'langdetect.detector', 'langdetect.detector_factory',
    'PIL', 'PIL.Image', 'PIL.ImageDraw', 'PIL.ImageFont',
    'ndspy', 'ndspy.rom',
    'ncompress',
    'threading', 'time', 'base64',
],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
)

pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    [],
    exclude_binaries=True,
    name='tradutor',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    console=True,
)

coll = COLLECT(
    exe,
    a.binaries,
    a.zipfiles,
    a.datas,
    strip=False,
    upx=True,
    upx_exclude=[],
    name='tradutor',
)