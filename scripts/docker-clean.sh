#!/bin/bash

echo "🛑 Deteniendo todos los contenedores..."
docker stop $(docker ps -aq) 2>/dev/null

echo "🗑️ Eliminando todos los contenedores..."
docker rm $(docker ps -aq) 2>/dev/null

echo "🧹 Eliminando todas las imágenes..."
docker rmi $(docker images -q) 2>/dev/null

echo "📦 Eliminando todos los volúmenes..."
docker volume rm $(docker volume ls -q) 2>/dev/null

echo "🌐 Eliminando redes no predeterminadas..."
docker network rm $(docker network ls | grep -v "bridge\|host\|none" | awk 'NR>1 {print $1}') 2>/dev/null

echo "✅ Limpieza completa de Docker realizada."
