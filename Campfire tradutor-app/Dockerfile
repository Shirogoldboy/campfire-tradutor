# Imagem cloud do servidor Campfire (só ZIP/RAR — ver CAMPFIRE_CLOUD_MODE em server.py).
# Build: docker build -t campfire-cloud-server .
# Run local: docker run -p 8000:8000 -e CAMPFIRE_CLOUD_MODE=1 -e CAMPFIRE_ACCESS_KEY=xxx campfire-cloud-server

FROM python:3.12-slim

WORKDIR /app

# unrar-free: extração de .rar (pacote livre, sem depender do unrar proprietário)
RUN apt-get update && apt-get install -y --no-install-recommends \
    unrar-free \
    && rm -rf /var/lib/apt/lists/*

COPY requirements-cloud.txt .
RUN pip install --no-cache-dir -r requirements-cloud.txt

COPY server.py tradutor.py ./

ENV CAMPFIRE_CLOUD_MODE=1

CMD ["python", "server.py"]
