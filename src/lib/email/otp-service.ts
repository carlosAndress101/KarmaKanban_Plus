import otpGenerator from "otp-generator";

import { db } from "@/lib/drizzle";
import { passwordResetTokens } from "@/lib/schemas_drizzle";
import { eq, and, gt } from "drizzle-orm";

export class OTPService {
  private static instance: OTPService;
  private otpStore = new Map<
    string,
    { otp: string; expiresAt: Date; attempts: number }
  >();

  private constructor() {}

  public static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  /**
   * Genera un código OTP de 6 dígitos
   */
  generateOTP(): string {
    return otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
  }

  /**
   * Guarda un OTP en memoria con expiración de 10 minutos
   */
  async storeOTP(email: string, otp: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expira en 10 minutos

    this.otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Limpiar OTP expirado después de 15 minutos (para dar margen)
    setTimeout(
      () => {
        this.otpStore.delete(email);
      },
      15 * 60 * 1000,
    );
  }

  /**
   * Verifica si un OTP es válido
   */
  async verifyOTP(
    email: string,
    providedOTP: string,
  ): Promise<{ valid: boolean; message: string }> {
    const storedData = this.otpStore.get(email);

    if (!storedData) {
      return {
        valid: false,
        message: "No se encontró código OTP para este email o ha expirado",
      };
    }

    // Verificar si ha expirado
    if (new Date() > storedData.expiresAt) {
      this.otpStore.delete(email);
      return {
        valid: false,
        message: "El código OTP ha expirado. Solicita uno nuevo",
      };
    }

    // Incrementar intentos
    storedData.attempts++;

    // Máximo 5 intentos
    if (storedData.attempts > 5) {
      this.otpStore.delete(email);
      return {
        valid: false,
        message: "Demasiados intentos fallidos. Solicita un nuevo código",
      };
    }

    // Verificar el código
    if (storedData.otp === providedOTP) {
      // OTP válido, eliminarlo del store
      this.otpStore.delete(email);
      return {
        valid: true,
        message: "Código OTP verificado correctamente",
      };
    }

    return {
      valid: false,
      message: `Código incorrecto. Intentos restantes: ${5 - storedData.attempts}`,
    };
  }

  /**
   * Genera un token único para el reset de contraseña
   */
  async generateResetToken(email: string): Promise<string> {
    // Generar un token único
    const token = otpGenerator.generate(32, {
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: false,
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expira en 30 minutos

    // Eliminar tokens anteriores para este email
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.email, email));

    // Crear nuevo token en la base de datos
    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
      used: false,
    });

    return token;
  }

  /**
   * Verifica si un token de reset es válido
   */
  async verifyResetToken(
    token: string,
  ): Promise<{ valid: boolean; email?: string; message: string }> {
    const tokenData = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      );

    if (tokenData.length === 0) {
      return {
        valid: false,
        message: "Token inválido o expirado",
      };
    }

    return {
      valid: true,
      email: tokenData[0].email,
      message: "Token válido",
    };
  }

  /**
   * Marca un token como usado
   */
  async markTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  /**
   * Limpia tokens expirados de la base de datos
   */
  async cleanupExpiredTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(gt(passwordResetTokens.expiresAt, new Date()));
  }

  /**
   * Elimina un OTP específico del store (útil para testing)
   */
  removeOTP(email: string): void {
    this.otpStore.delete(email);
  }

  /**
   * Verifica si existe un OTP para un email
   */
  hasOTP(email: string): boolean {
    return this.otpStore.has(email);
  }

  /**
   * Obtiene el tiempo restante para un OTP en segundos
   */
  getOTPTimeRemaining(email: string): number {
    const storedData = this.otpStore.get(email);
    if (!storedData) return 0;

    const now = new Date();
    const timeRemaining = Math.max(
      0,
      Math.floor((storedData.expiresAt.getTime() - now.getTime()) / 1000),
    );

    return timeRemaining;
  }
}

export const otpService = OTPService.getInstance();
