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
   * Generates a 6-digit OTP code
   */
  generateOTP(): string {
    return otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });
  }

  /**
   * Stores an OTP in memory with 10-minute expiration
   */
  async storeOTP(email: string, otp: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // Expires in 10 minutes

    this.otpStore.set(email, {
      otp,
      expiresAt,
      attempts: 0,
    });

    // Clean expired OTP after 15 minutes (to give margin)
    setTimeout(() => {
      this.otpStore.delete(email);
    }, 15 * 60 * 1000);
  }

  /**
   * Verifies if an OTP is valid
   */
  async verifyOTP(
    email: string,
    providedOTP: string
  ): Promise<{ valid: boolean; message: string }> {
    const storedData = this.otpStore.get(email);

    if (!storedData) {
      return {
        valid: false,
        message: "OTP code not found for this email or has expired",
      };
    }

    // Check if expired
    if (new Date() > storedData.expiresAt) {
      this.otpStore.delete(email);
      return {
        valid: false,
        message: "OTP code has expired. Request a new one",
      };
    }

    // Increment attempts
    storedData.attempts++;

    // Maximum 5 attempts
    if (storedData.attempts > 5) {
      this.otpStore.delete(email);
      return {
        valid: false,
        message: "Too many failed attempts. Request a new code",
      };
    }

    // Verify the code
    if (storedData.otp === providedOTP) {
      // Valid OTP, remove it from store
      this.otpStore.delete(email);
      return {
        valid: true,
        message: "OTP code verified successfully",
      };
    }

    return {
      valid: false,
      message: `Incorrect code. Remaining attempts: ${5 - storedData.attempts}`,
    };
  }

  /**
   * Generates a unique token for password reset
   */
  async generateResetToken(email: string): Promise<string> {
    // Generate a unique token
    const token = otpGenerator.generate(32, {
      lowerCaseAlphabets: true,
      upperCaseAlphabets: true,
      specialChars: false,
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30); // Expires in 30 minutes

    // Remove previous tokens for this email
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.email, email));

    // Create new token in database
    await db.insert(passwordResetTokens).values({
      email,
      token,
      expiresAt,
      used: false,
    });

    return token;
  }

  /**
   * Verifies if a reset token is valid
   */
  async verifyResetToken(
    token: string
  ): Promise<{ valid: boolean; email?: string; message: string }> {
    const tokenData = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, new Date())
        )
      );

    if (tokenData.length === 0) {
      return {
        valid: false,
        message: "Invalid or expired token",
      };
    }

    return {
      valid: true,
      email: tokenData[0].email,
      message: "Valid token",
    };
  }

  /**
   * Marks a token as used
   */
  async markTokenAsUsed(token: string): Promise<void> {
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.token, token));
  }

  /**
   * Cleans expired tokens from database
   */
  async cleanupExpiredTokens(): Promise<void> {
    await db
      .delete(passwordResetTokens)
      .where(gt(passwordResetTokens.expiresAt, new Date()));
  }

  /**
   * Removes a specific OTP from store (useful for testing)
   */
  removeOTP(email: string): void {
    this.otpStore.delete(email);
  }

  /**
   * Checks if an OTP exists for an email
   */
  hasOTP(email: string): boolean {
    return this.otpStore.has(email);
  }

  /**
   * Gets the remaining time for an OTP in seconds
   */
  getOTPTimeRemaining(email: string): number {
    const storedData = this.otpStore.get(email);
    if (!storedData) return 0;

    const now = new Date();
    const timeRemaining = Math.max(
      0,
      Math.floor((storedData.expiresAt.getTime() - now.getTime()) / 1000)
    );

    return timeRemaining;
  }
}

export const otpService = OTPService.getInstance();
