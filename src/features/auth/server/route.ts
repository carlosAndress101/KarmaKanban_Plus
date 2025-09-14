import { Hono } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";
import { zValidator } from "@hono/zod-validator";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";
import { db } from "@/lib/drizzle";
import { AUTH_COOKIE, SECRET_JWT } from "../constants";
import { users } from "@/lib/schemas_drizzle";
import { eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { protectedRoute } from "@/lib/session";
import { emailService } from "@/lib/email/email-service";
import { otpService } from "@/lib/email/otp-service";

const app = new Hono()
  .get("/current", protectedRoute, async (c) => {
    const user = c.get("user");
    return c.json({ data: user });
  })
  .post("/login", zValidator("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");

    //check if email exists
    const userDt = await db.select().from(users).where(eq(users.email, email));
    if (userDt.length === 0) {
      return c.json({ error: "Incorrect email or password" }, 401);
    }

    //check if password is correct
    const comparePassword = await bcrypt.compare(password, userDt[0].password);
    if (!comparePassword) {
      return c.json({ error: "Incorrect email or password" }, 401);
    }

    const payload = {
      sub: userDt[0].id,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // expires in 24 hours
      email: userDt[0].email,
    };

    const tk = await sign(payload, SECRET_JWT);

    //set cookie
    setCookie(c, AUTH_COOKIE, tk, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/register", zValidator("json", registerSchema), async (c) => {
    const { name, lastName, email, password } = c.req.valid("json");

    const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]+$/;
    if (!regex.test(name)) {
      return c.json({ success: false, message: "Invalid name" }, 400);
    }
    // Verificar si el usuario ya existe
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 1) {
      return c.json({ success: false, message: "The user already exists" }, 409);
    }

    // Generar hash de la contraseña
    const passhash = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    const userDt = await db
      .insert(users)
      .values({
        name,
        lastName,
        email,
        password: passhash,
      })
      .returning({ id: users.id, email: users.email });

    const payload = {
      sub: userDt[0].id,
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // expires in 24 hours
      email: userDt[0].email,
    };

    const tk = await sign(payload, SECRET_JWT);

    setCookie(c, AUTH_COOKIE, tk, {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 30,
    });

    return c.json({ success: true });
  })
  .post("/logout", protectedRoute, async (c) => {
    deleteCookie(c, AUTH_COOKIE);
    c.set("authenticated", false);
    c.set("user", null);
    return c.json({ success: true });
  })
  .post(
    "/forgot-password",
    zValidator("json", forgotPasswordSchema),
    async (c) => {
      const { email } = c.req.valid("json");

      try {
        // Verificar si el usuario existe
        const userDt = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (userDt.length === 0) {
          // Por seguridad, no revelamos si el email existe o no
          return c.json({
            success: true,
            message:
              "Si el email está registrado, recibirás un código de verificación",
          });
        }

        const user = userDt[0];

        // Generar OTP
        const otp = otpService.generateOTP();

        // Almacenar OTP
        await otpService.storeOTP(email, otp);

        // Enviar email con OTP
        const emailSent = await emailService.sendOTPEmail(
          email,
          otp,
          user.name,
        );

        if (!emailSent) {
          return c.json(
            { error: "Error al enviar el código de verificación" },
            500,
          );
        }

        return c.json({
          success: true,
          message: "Código de verificación enviado a tu email",
          timeRemaining: otpService.getOTPTimeRemaining(email),
        });
      } catch (error) {
        console.error("Error in forgot-password:", error);
        return c.json({ error: "Error interno del servidor" }, 500);
      }
    },
  )
  .post("/verify-otp", zValidator("json", verifyOtpSchema), async (c) => {
    const { email, otp } = c.req.valid("json");

    try {
      // Verificar OTP
      const verification = await otpService.verifyOTP(email, otp);

      if (!verification.valid) {
        return c.json({ error: verification.message }, 400);
      }

      // Generar token para reset de contraseña
      const resetToken = await otpService.generateResetToken(email);

      return c.json({
        success: true,
        message: "Código verificado correctamente",
        resetToken: resetToken,
      });
    } catch (error) {
      console.error("Error in verify-otp:", error);
      return c.json({ error: "Error interno del servidor" }, 500);
    }
  })
  .post(
    "/reset-password",
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { token, password } = c.req.valid("json");

      try {
        // Verificar token
        const tokenVerification = await otpService.verifyResetToken(token);

        if (!tokenVerification.valid || !tokenVerification.email) {
          return c.json({ error: tokenVerification.message }, 400);
        }

        const email = tokenVerification.email;

        // Obtener usuario
        const userDt = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (userDt.length === 0) {
          return c.json({ error: "Usuario no encontrado" }, 404);
        }

        const user = userDt[0];

        // Hash nueva contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Actualizar contraseña
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.email, email));

        // Marcar token como usado
        await otpService.markTokenAsUsed(token);

        // Enviar email de confirmación
        await emailService.sendPasswordResetConfirmation(email, user.name);

        return c.json({
          success: true,
          message: "Contraseña actualizada correctamente",
        });
      } catch (error) {
        console.error("Error in reset-password:", error);
        return c.json({ error: "Error interno del servidor" }, 500);
      }
    },
  )
  .post("/resend-otp", zValidator("json", forgotPasswordSchema), async (c) => {
    const { email } = c.req.valid("json");

    try {
      // Verificar si el usuario existe
      const userDt = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (userDt.length === 0) {
        return c.json({ error: "Email no registrado" }, 404);
      }

      // Verificar si ya existe un OTP activo
      const timeRemaining = otpService.getOTPTimeRemaining(email);
      if (timeRemaining > 480) {
        // Si quedan más de 8 minutos (de 10 total)
        return c.json(
          {
            error: "Debes esperar antes de solicitar un nuevo código",
            timeRemaining: timeRemaining,
          },
          429,
        );
      }

      const user = userDt[0];

      // Generar nuevo OTP
      const otp = otpService.generateOTP();

      // Almacenar OTP (esto reemplaza el anterior si existe)
      await otpService.storeOTP(email, otp);

      // Enviar email con OTP
      const emailSent = await emailService.sendOTPEmail(email, otp, user.name);

      if (!emailSent) {
        return c.json(
          { error: "Error al enviar el código de verificación" },
          500,
        );
      }

      return c.json({
        success: true,
        message: "Nuevo código de verificación enviado",
        timeRemaining: otpService.getOTPTimeRemaining(email),
      });
    } catch (error) {
      console.error("Error in resend-otp:", error);
      return c.json({ error: "Error interno del servidor" }, 500);
    }
  });

export default app;
