#!/bin/bash
# Script para automatizar la creación/configuración de base de datos local y variables de entorno

set -e

ENV_FILE=".env.local"
DB_PORT=5432
DB_USER="kkplus_user"
DB_PASSWORD="kkplus_pass"
DB_NAME="kkplus_db"

# Selección de tipo de base de datos

echo "¿Qué tipo de base de datos deseas usar?"
echo "1) Local (Docker Compose)"
echo "2) Existente (URL personalizada)"
read -p "Selecciona una opción [1/2]: " db_option

run_migrations=true

if [[ "$db_option" == "1" ]]; then
    echo "Levantando base de datos local y pgAdmin con Docker Compose..."
    docker compose up -d db pgadmin
    DB_URL="postgres://$DB_USER:$DB_PASSWORD@localhost:$DB_PORT/$DB_NAME"
    echo "Esperando a que la base de datos esté lista..."
    sleep 5
    echo "Puedes ver tu base de datos en pgAdmin: http://localhost:5050"
    echo "Usuario: admin@kkplus.local | Contraseña: admin123"
elif [[ "$db_option" == "2" ]]; then
    read -p "URL de conexión (por ejemplo, postgres://user:pass@host:port/db): " DB_URL
    read -p "¿Deseas correr las migraciones? [y/n]: " run_mig
    if [[ "$run_mig" != "y" && "$run_mig" != "Y" ]]; then
        run_migrations=false
    fi
else
    echo "Opción no válida. Saliendo."
    exit 1
fi

echo "DATABASE_URL=$DB_URL" > "$ENV_FILE"

echo "Variables de entorno guardadas en $ENV_FILE:"
cat "$ENV_FILE"

echo "Probando conexión a la base de datos..."

if [[ "$run_migrations" != false ]]; then
    echo "Ejecutando migraciones..."
    export $(grep DATABASE_URL .env.local) && bunx drizzle-kit push
fi

echo "Probando conexión a la base de datos..."
if export $(grep DATABASE_URL .env.local) && bunx drizzle-kit introspect > /dev/null 2>&1; then
    echo "¡Conexión exitosa y migraciones aplicadas!"
else
    echo "Error: No se pudo conectar a la base de datos o aplicar migraciones."
    exit 1
fi

echo "Listo. Puedes iniciar el proyecto con 'bun dev'."
