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
    userName: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: '"KarmaKanban"',
        to: to,
        subject: "Verification Code - Password Recovery",
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
                  <h1>🔐 Password Recovery</h1>
                  <p>KarmaKanban</p>
                </div>
                <div class="content">
                  <h2>Hello ${userName}!</h2>
                  <p>You have requested to recover your password. Use the following verification code to continue:</p>

                  <div class="otp-code">${otp}</div>

                  <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                      <li>This code expires in 10 minutes</li>
                      <li>It can only be used once</li>
                      <li>Don't share this code with anyone</li>
                    </ul>
                  </div>

                  <p>If you haven't requested this code, you can safely ignore this message.</p>

                  <p>If you need help, contact our support team.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} KarmaKanban - Project Management System</p>
                  <p>This is an automated message, please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
          KarmaKanban - Password Recovery

          Hello ${userName}!

          You have requested to recover your password. Your verification code is: ${otp}

          IMPORTANT:
          - This code expires in 10 minutes
          - It can only be used once
          - Don't share this code with anyone

          If you haven't requested this code, you can ignore this message.

          © ${new Date().getFullYear()} KarmaKanban
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return false;
    }
  }

  async sendPasswordResetConfirmation(
    to: string,
    userName: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: '"KarmaKanban"',
        to: to,
        subject: "Password Updated Successfully",
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
                  <h1>✅ Password Updated</h1>
                  <p>KarmaKanban</p>
                </div>
                <div class="content">
                  <h2>Hello ${userName}!</h2>

                  <div class="success">
                    <strong>🎉 Success!</strong> Your password has been updated successfully.
                  </div>

                  <p>Your KarmaKanban password has been successfully changed. You can now sign in with your new password.</p>

                  <p><strong>Update date:</strong> ${new Date().toLocaleString(
                    "en-US"
                  )}</p>

                  <p>If you haven't made this change, contact our support team immediately.</p>

                  <p>Thank you for using KarmaKanban.</p>
                </div>
                <div class="footer">
                  <p>© ${new Date().getFullYear()} KarmaKanban - Project Management System</p>
                  <p>This is an automated message, please do not reply.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
          KarmaKanban - Password Updated

          Hello ${userName}!

          Your password has been updated successfully.
          Date: ${new Date().toLocaleString("en-US")}

          If you haven't made this change, contact support immediately.

          © ${new Date().getFullYear()} KarmaKanban
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending password reset confirmation email:", error);
      return false;
    }
  }
}

// Email service configuration
const emailConfig: EmailConfig = {
  service: process.env.EMAIL_SERVICE || "gmail",
  user: process.env.EMAIL_USER || "",
  pass: process.env.EMAIL_PASS || "",
};

export const emailService = new EmailService(emailConfig);
