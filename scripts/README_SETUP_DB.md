# Automatización de Base de Datos Local para KarmaKanban_Plus

Este proyecto incluye un script para automatizar la configuración de una base de datos local y las variables de entorno necesarias para el desarrollo.

## ¿Qué hace el script?
- Te pregunta si quieres usar una base de datos existente o crear una nueva local (usando Docker y PostgreSQL).
- Crea o actualiza el archivo `.env.local` con la URL de conexión.
- Corre las migraciones usando Drizzle.
- Prueba la conexión a la base de datos.

## Uso

1. Asegúrate de tener Docker y Bun instalados y tambien docker compose.
2. Da permisos de ejecución al script en caso de estar en linux si no solo ejecuta el script:
   ```bash
   chmod +x scripts/setup_local_db.sh
   ```
3. Ejecuta el script:
   ```bash
   ./scripts/setup_local_db.sh
   ```
4. Sigue las instrucciones interactivas:
   - Si eliges crear una base local, se levantará un contenedor Docker con PostgreSQL.
   - Si eliges usar una existente, deberás ingresar la URL de conexión.
5. El script actualizará `.env.local`, correrá las migraciones y probará la conexión.

> ⚠️ Este script está diseñado para sistemas Linux y macOS. En Windows, debes usar WSL, Git Bash o una terminal compatible con Bash y los comandos utilizados (docker, bun, grep, etc). No funcionará en CMD o PowerShell puro.

## Notas
- El contenedor local se llama `kkplus_local_db` y usa el puerto 5432 por defecto.
- Puedes modificar los valores por defecto editando el script.
- Si ya existe un contenedor con ese nombre, será reemplazado.

## Problemas comunes
- Si el puerto 5432 está ocupado, edita el script y cambia la variable `DB_PORT`.
- Si tienes problemas de conexión, revisa los logs del contenedor Docker:
  ```bash
  docker logs kkplus_local_db
  ```

---

¡Listo! Ahora puedes desarrollar con una base de datos local fácilmente.
