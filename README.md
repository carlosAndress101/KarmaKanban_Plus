# ⭐KarmaKanban⭐

KarmaKanban es una aplicación de gestión de proyectos y tareas tipo Kanban, con soporte para gamificación, múltiples workspaces y analíticas. Construida con Next.js, Drizzle ORM, PostgreSQL y Docker.

---

## Arquitectura

- **Frontend:** Next.js (App Router, TypeScript, SSR/SSG)
- **Backend/API:** Next.js API Routes, Drizzle ORM
- **Base de datos:** PostgreSQL (Docker)
- **ORM:** Drizzle
- **Autenticación:** JWT, endpoints personalizados
- **Gamificación:** Sistema de puntos, recompensas y analíticas
- **Panel visual de base de datos:** pgAdmin (Docker)
- **DevOps:** Docker Compose para orquestar servicios

## Estructura principal

- `/src/app` — Entrypoint de la app, rutas, layouts y páginas
- `/src/features` — Módulos de dominio: auth, gamification, members, projects, store, tasks, workspaces
- `/src/components` — Componentes UI reutilizables
- `/src/lib` — Utilidades, configuración de Drizzle, esquemas
- `/migrations` — Migraciones SQL generadas por Drizzle
- `/public` — Recursos estáticos

## Requisitos

- Node.js >= 18
- Bun (recomendado) o npm/yarn/pnpm
- Docker y Docker Compose

## Primeros pasos

1. **Clona el repositorio:**
   ```bash
   git clone <repo-url>
   cd KarmaKanban_Plus
   ```
2. **Configura la base de datos y variables de entorno:**
   Ejecuta el script interactivo:

   ```bash
   ./scripts/setup_local_db.sh
   ```

   > ⚠️ En Windows, usa WSL o Git Bash. No compatible con CMD/PowerShell puro.

3. **Inicia el servidor de desarrollo:**

   ```bash
   bun dev
   # o npm run dev, yarn dev, pnpm dev
   ```

4. **Accede a la app:**
   - [http://localhost:3000](http://localhost:3000)
5. **Accede a pgAdmin (opcional):**
   - [http://localhost:5050](http://localhost:5050)
   - Usuario: admin@kkplus.com
   - Contraseña: admin123

## Scripts útiles

- `./scripts/setup_local_db.sh` — Automatiza la creación/configuración de la base de datos y variables de entorno.
- `docker compose up -d db pgadmin` — Levanta la base de datos y el panel visual.
- `bunx drizzle-kit push` — Aplica migraciones manualmente.

## Despliegue

- Puedes desplegar fácilmente en Vercel o cualquier plataforma compatible con Next.js.
- Para producción, configura las variables de entorno y la base de datos en tu entorno de despliegue.

## Variables de entorno (ejemplo)

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
# (requerida) URL de conexión a la base de datos
DATABASE_URL=postgres://kkplus_user:kkplus_pass@localhost:5432/kkplus_db

# (requerido) Clave secreta para JWT u otras integraciones
# JWT_SECRET=tu_clave_secreta

# (requerido) Configuración de correo, APIs externas, etc.
# COOKIE_SECRET=smtp.example.com

# (requerido) Puerto de la app.
# PORT=4321

```

## 🧑‍💻Authors

- [@Samuel-Aroca](https://www.github.com/SamuelAroca)
- [@Jim-Diaz](https://www.github.com/JimDiazC)
- [@Carlos-Andrés](https://www.github.com/carlosandress101)

## Support

For support, email carloshinestroza101@gmail.com

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Docker Compose](https://docs.docker.com/compose/)

---

¿Dudas? Abre un issue o revisa los scripts y documentación en la carpeta `/scripts`.
