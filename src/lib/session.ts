import { createMiddleware } from "hono/factory";
import { deleteCookie, getCookie } from "hono/cookie";
import { verify } from "hono/jwt";
import { eq } from "drizzle-orm";
import { AUTH_COOKIE, SECRET_JWT } from "@/features/auth/constants";
import { users } from "./schemas_drizzle";
import { db } from "./drizzle";

export const sessionMiddleware = createMiddleware(
  async (c, next) => {
    c.set("authenticated", false);
    c.set("user", null);

    // Obtener el token de la cookie
    const sessionToken = getCookie(c, AUTH_COOKIE);

    if (!sessionToken) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    let payload;
    try {
      payload = await verify(sessionToken, SECRET_JWT);
    } catch (err) {
      deleteCookie(c, AUTH_COOKIE, {
        path: '/',
        secure: true,
      })
      return c.json({ error: "Se terminno tu seccion", stack: err }, 401);
    }

    // Validar estructura del payload
    if (!payload.sub || !payload?.email || typeof payload.sub !== 'string') {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const userRecord = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        lastName: users.lastName,
      }).from(users).where(eq(users.id, payload.sub)).limit(1);

      if (userRecord.length === 0) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      c.set("user", userRecord[0]);
      c.set("authenticated", true);
    } catch (err) {
      console.error("Error al buscar el usuario:", err);
      return c.json({ error: "Unauthorized" }, 401);
    }
    await next();
  }
);

export const protectedRoute = sessionMiddleware;
