# Acceso visual a la base de datos con pgAdmin

Se ha agregado pgAdmin y PostgreSQL al `docker-compose.yml` para facilitar la administración visual de la base de datos.

## ¿Cómo usar?

1. Levanta los servicios:
   ```bash
   docker-compose up -d db pgadmin
   ```
2. Accede a pgAdmin en tu navegador:
   - URL: http://localhost:5050
   - Usuario: admin@kkplus.local
   - Contraseña: admin123
3. Agrega un nuevo servidor en pgAdmin:
   - **Host:** db
   - **Usuario:** kkplus_user
   - **Contraseña:** kkplus_pass
   - **Base de datos:** kkplus_db

## Notas
- El contenedor de la base de datos se llama `kkplus_local_db`.
- El contenedor de pgAdmin se llama `kkplus_pgadmin`.
- Los datos se persisten en volúmenes Docker.

---

¡Ahora puedes administrar y visualizar tu base de datos PostgreSQL fácilmente desde pgAdmin!
