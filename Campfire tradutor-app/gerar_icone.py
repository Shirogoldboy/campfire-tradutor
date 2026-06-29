from PIL import Image
import os

img = Image.open("build/icon.png")
img = img.resize((256, 256))
img.save("build/icon.ico", format="ICO", sizes=[(256, 256)])
print("Ícone gerado com sucesso!")