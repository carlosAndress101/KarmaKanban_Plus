import nodemailer from "nodemailer";

export interface EmailConfig {
  service: string;
  user: string;
  pass: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      service: config.service,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendOTPEmail(
    to: string,
    otp: string,
    userName: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: '"KarmaKanban Plus" <carlostheoro@gmail.com>',
        to: to,
        subject: "Código de Verificación - Recuperar Contraseña",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .otp-code { background: #667eea; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🔐 Recuperación de Contraseña</h1>
                  <p>KarmaKanban Plus</p>
                </div>
                <div class="content">
                  <h2>¡Hola ${userName}!</h2>
                  <p>Has solicitado recuperar tu contraseña. Utiliza el siguiente código de verificación para continuar:</p>

                  <div class="otp-code">${otp}</div>

                  <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                      <li>Este código expira en 10 minutos</li>
                      <li>Solo puede ser utilizado una vez</li>
                      <li>No compartas este código con nadie</li>
                    </ul>
                  </div>

                  <p>Si no has solicitado este código, puedes ignorar este mensaje de forma segura.</p>

                  <p>Si necesitas ayuda, contacta a nuestro equipo de soporte.</p>
                </div>
                <div class="footer">
                  <p>© 2024 KarmaKanban Plus - Sistema de Gestión de Proyectos</p>
                  <p>Este es un mensaje automático, por favor no responder.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
          KarmaKanban Plus - Recuperación de Contraseña

          ¡Hola ${userName}!

          Has solicitado recuperar tu contraseña. Tu código de verificación es: ${otp}

          IMPORTANTE:
          - Este código expira en 10 minutos
          - Solo puede ser utilizado una vez
          - No compartas este código con nadie

          Si no has solicitado este código, puedes ignorar este mensaje.

          © 2024 KarmaKanban Plus
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("OTP Email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return false;
    }
  }

  async sendPasswordResetConfirmation(
    to: string,
    userName: string,
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: '"KarmaKanban Plus" <carlostheoro@gmail.com>',
        to: to,
        subject: "Contraseña Actualizada Exitosamente",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #00b894 0%, #00cec9 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Contraseña Actualizada</h1>
                  <p>KarmaKanban Plus</p>
                </div>
                <div class="content">
                  <h2>¡Hola ${userName}!</h2>

                  <div class="success">
                    <strong>🎉 ¡Éxito!</strong> Tu contraseña ha sido actualizada correctamente.
                  </div>

                  <p>Tu contraseña de KarmaKanban Plus ha sido cambiada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.</p>

                  <p><strong>Fecha de actualización:</strong> ${new Date().toLocaleString("es-ES")}</p>

                  <p>Si no has realizado este cambio, contacta inmediatamente a nuestro equipo de soporte.</p>

                  <p>Gracias por usar KarmaKanban Plus.</p>
                </div>
                <div class="footer">
                  <p>© 2024 KarmaKanban Plus - Sistema de Gestión de Proyectos</p>
                  <p>Este es un mensaje automático, por favor no responder.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
          KarmaKanban Plus - Contraseña Actualizada

          ¡Hola ${userName}!

          Tu contraseña ha sido actualizada correctamente.
          Fecha: ${new Date().toLocaleString("es-ES")}

          Si no has realizado este cambio, contacta a soporte inmediatamente.

          © 2024 KarmaKanban Plus
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("Password reset confirmation email sent:", info.messageId);
      return true;
    } catch (error) {
      console.error("Error sending password reset confirmation email:", error);
      return false;
    }
  }
}

// Configuración del servicio de email
const emailConfig: EmailConfig = {
  service: process.env.EMAIL_SERVICE || "gmail",
  user: process.env.EMAIL_USER || "",
  pass: process.env.EMAIL_PASS || "",
};

export const emailService = new EmailService(emailConfig);
