import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import { loginSchema, registerSchema } from "@/feature/auth/schemas";
import { db } from "@/lib/drizzle";
import { AUTH_COOKIE, SECRET_JWT } from "../constants";
import { users } from "@/lib/schemas_drizzle";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { protectedRoute } from "@/lib/session";

const app = new Hono()
    .get("/current", protectedRoute, async (c) => {
        const user = c.get("user");
        return c.json({ data: user});
    })
    .post("/login", zValidator("json", loginSchema),  async (c) => {
        const { email, password } = c.req.valid("json");

        //check if email exists
        const userDt = await db.select().from(users).where(eq(users.email, email));
        if (userDt.length === 0) {
            return c.json({ error: "Correo o contraseña incorrectos" }, 401);
        }

        //check if password is correct
        const comparePassword = await bcrypt.compare(password, userDt[0].password);
        if (!comparePassword) {
            return c.json({ error: "Correo o contraseña incorrectos" }, 401);
        }

        const payload = {
            sub: userDt[0].id,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // expires in 24 hours
            email: userDt[0].email
        }

        const tk = await sign(payload, SECRET_JWT)

        //set cookie
        setCookie(c, AUTH_COOKIE, tk, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 60 * 60 * 24 * 30
        });

        return c.json({ success: true });
    })
    .post("/register", zValidator("json", registerSchema), async (c) => {

        const { name, lastName, email, password } = c.req.valid("json");

        const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/;
        if (!regex.test(name)) {
            return c.json({ success: false, message: "Nombre no válido"}, 400);
        }
        // Verificar si el usuario ya existe
        const existingUser = await db.select({id: users.id}).from(users).where(eq(users.email, email));
    
        if (existingUser.length > 1){
            return c.json({ success: false, message: "El usuario ya existe"}, 409);
        }

        // Generar hash de la contraseña
        const passhash = await bcrypt.hash(password, 10);

        // Insertar usuario en la base de datos
        const userDt = await db.insert(users).values({ 
            name,
            lastName,
            email,
            password: passhash 
        }).returning({id: users.id, email: users.email})
        
        const payload = {
            sub: userDt[0].id,
            exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // expires in 24 hours
            email: userDt[0].email
        }

        const tk = await sign(payload, SECRET_JWT)

        setCookie(c, AUTH_COOKIE, tk, {
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 60 * 60 * 24 * 30
        });

        return c.json({ success: true });
    })
    .post("/logout", protectedRoute, async (c) => {
        deleteCookie(c, AUTH_COOKIE);
        c.set("authenticated", false);
        c.set("user", null);
        return c.json({ success: true });
    })
    
    export default  app;