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
      // Allow non-HTTPS in local development
      secure: process.env.NODE_ENV === "production",
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
    // Check if user already exists
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length >= 1) {
      return c.json(
        { success: false, message: "The user already exists" },
        409
      );
    }

    // Generate password hash
    const passhash = await bcrypt.hash(password, 10);

    // Insert user in database
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
      secure: process.env.NODE_ENV === "production",
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
        // Check if user exists
        const userDt = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (userDt.length === 0) {
          // For security, we don't reveal if the email exists or not
          return c.json({
            success: true,
            message:
              "If the email is registered, you will receive a verification code",
          });
        }

        const user = userDt[0];

        // Generate OTP
        const otp = otpService.generateOTP();

        // Store OTP
        await otpService.storeOTP(email, otp);

        // Send email with OTP
        const emailSent = await emailService.sendOTPEmail(
          email,
          otp,
          user.name
        );

        if (!emailSent) {
          return c.json({ error: "Error sending verification code" }, 500);
        }

        return c.json({
          success: true,
          message: "Verification code sent to your email",
          timeRemaining: otpService.getOTPTimeRemaining(email),
        });
      } catch (error) {
        console.error("Error in forgot-password:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  .post("/verify-otp", zValidator("json", verifyOtpSchema), async (c) => {
    const { email, otp } = c.req.valid("json");

    try {
      // Verify OTP
      const verification = await otpService.verifyOTP(email, otp);

      if (!verification.valid) {
        return c.json({ error: verification.message }, 400);
      }

      // Generate token for password reset
      const resetToken = await otpService.generateResetToken(email);

      return c.json({
        success: true,
        message: "Code verified successfully",
        resetToken: resetToken,
      });
    } catch (error) {
      console.error("Error in verify-otp:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  })
  .post(
    "/reset-password",
    zValidator("json", resetPasswordSchema),
    async (c) => {
      const { token, password } = c.req.valid("json");

      try {
        // Verify token
        const tokenVerification = await otpService.verifyResetToken(token);

        if (!tokenVerification.valid || !tokenVerification.email) {
          return c.json({ error: tokenVerification.message }, 400);
        }

        const email = tokenVerification.email;

        // Get user
        const userDt = await db
          .select()
          .from(users)
          .where(eq(users.email, email));

        if (userDt.length === 0) {
          return c.json({ error: "User not found" }, 404);
        }

        const user = userDt[0];

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update password
        await db
          .update(users)
          .set({ password: hashedPassword })
          .where(eq(users.email, email));

        // Mark token as used
        await otpService.markTokenAsUsed(token);

        // Send confirmation email
        await emailService.sendPasswordResetConfirmation(email, user.name);

        return c.json({
          success: true,
          message: "Password updated successfully",
        });
      } catch (error) {
        console.error("Error in reset-password:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    }
  )
  .post("/resend-otp", zValidator("json", forgotPasswordSchema), async (c) => {
    const { email } = c.req.valid("json");

    try {
      // Check if user exists
      const userDt = await db
        .select()
        .from(users)
        .where(eq(users.email, email));

      if (userDt.length === 0) {
        return c.json({ error: "Email not registered" }, 404);
      }

      // Check if an active OTP already exists
      const timeRemaining = otpService.getOTPTimeRemaining(email);
      if (timeRemaining > 480) {
        // If more than 8 minutes remain (out of 10 total)
        return c.json(
          {
            error: "You must wait before requesting a new code",
            timeRemaining: timeRemaining,
          },
          429
        );
      }

      const user = userDt[0];

      // Generate new OTP
      const otp = otpService.generateOTP();

      // Store OTP (this replaces the previous one if it exists)
      await otpService.storeOTP(email, otp);

      // Send email with OTP
      const emailSent = await emailService.sendOTPEmail(email, otp, user.name);

      if (!emailSent) {
        return c.json({ error: "Error sending verification code" }, 500);
      }

      return c.json({
        success: true,
        message: "New verification code sent",
        timeRemaining: otpService.getOTPTimeRemaining(email),
      });
    } catch (error) {
      console.error("Error in resend-otp:", error);
      return c.json({ error: "Internal server error" }, 500);
    }
  });

export default app;
