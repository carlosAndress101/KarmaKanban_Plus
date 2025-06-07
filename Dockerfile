# Imagen base con Bun
FROM oven/bun:latest

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos del proyecto
COPY . .

# Instalar dependencias
RUN bun install

# Construir la app
RUN bun run build

# Exponer el puerto (ajústalo si es necesario)
EXPOSE 5000

# Comando para iniciar en producción
CMD ["bun", "run", "start"]