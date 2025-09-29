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

  async sendEmailVerificationCode(
    to: string,
    otp: string,
    userName: string
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: '"KarmaKanban"',
        to: to,
        subject: "Email Verification Code",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .otp-code { background: #10b981; color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 20px 0; }
                .info { background: #dbeafe; border: 1px solid #93c5fd; color: #1e40af; padding: 15px; border-radius: 4px; margin: 20px 0; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 4px; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📧 Email Verification</h1>
                  <p>KarmaKanban</p>
                </div>
                <div class="content">
                  <h2>Hello ${userName}!</h2>
                  <p>Please verify your email address to secure your account. Use the following verification code:</p>

                  <div class="otp-code">${otp}</div>

                  <div class="info">
                    <strong>🔐 Why verify your email?</strong>
                    <ul>
                      <li>Secure password recovery</li>
                      <li>Important account notifications</li>
                      <li>Enhanced account security</li>
                    </ul>
                  </div>

                  <div class="warning">
                    <strong>⚠️ Important:</strong>
                    <ul>
                      <li>This code expires in 10 minutes</li>
                      <li>It can only be used once</li>
                      <li>Don't share this code with anyone</li>
                    </ul>
                  </div>

                  <p>If you haven't requested this verification, you can safely ignore this message.</p>

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
          KarmaKanban - Email Verification

          Hello ${userName}!

          Please verify your email address to secure your account. Your verification code is: ${otp}

          Why verify your email?
          - Secure password recovery
          - Important account notifications
          - Enhanced account security

          IMPORTANT:
          - This code expires in 10 minutes
          - It can only be used once
          - Don't share this code with anyone

          If you haven't requested this verification, you can ignore this message.

          © ${new Date().getFullYear()} KarmaKanban
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending email verification code:", error);
      return false;
    }
  }

  async sendTaskAssignedEmail(
    to: string,
    taskData: {
      taskName: string;
      projectName: string;
      workspaceName: string;
      assignedBy: string;
      priority: string;
      dueDate?: string;
      description?: string;
      workspaceId: string;
      taskId: string;
    }
  ): Promise<boolean> {
    try {
      const taskUrl =
        `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/${taskData.workspaceId}/tasks/${taskData.taskId}`.trim();

      const priorityColors: Record<string, string> = {
        low: "#28a745",
        medium: "#ffc107",
        high: "#fd7e14",
        urgent: "#dc3545",
      };

      const priorityColor =
        priorityColors[taskData.priority.toLowerCase()] || "#6c757d";

      const mailOptions = {
        from: '"KarmaKanban" <soportekarmakanban@gmail.com>',
        to: to,
        subject: `New Task Assigned: ${taskData.taskName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .task-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; color: white; font-size: 12px; font-weight: bold; text-transform: uppercase; }
                .cta-button { background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>📋 New Task Assigned</h1>
                  <p>KarmaKanban</p>
                </div>
                <div class="content">
                  <h2>You have a new task!</h2>
                  <p>Hello! <strong>${
                    taskData.assignedBy
                  }</strong> has assigned you a new task in the <strong>${
          taskData.workspaceName
        }</strong> workspace.</p>

                  <div class="task-card">
                    <h3 style="margin: 0 0 10px 0; color: #4f46e5;">${
                      taskData.taskName
                    }</h3>
                    <p><strong>Project:</strong> ${taskData.projectName}</p>
                    <p><strong>Priority:</strong> <span class="priority-badge" style="background-color: ${priorityColor};">${
          taskData.priority
        }</span></p>
                    ${
                      taskData.dueDate
                        ? `<p><strong>Due Date:</strong> ${taskData.dueDate}</p>`
                        : ""
                    }
                    ${
                      taskData.description
                        ? `<p><strong>Description:</strong> ${taskData.description}</p>`
                        : ""
                    }
                  </div>

                  <p>Start working on this task to earn points and help your team reach their goals!</p>
                  
                  <p style="font-size: 12px; color: #666; margin: 10px 0;">You can access your task in KarmaKanban by logging into your workspace.</p>
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
          KarmaKanban - New Task Assigned

          You have a new task!

          Task: ${taskData.taskName}
          Project: ${taskData.projectName}
          Workspace: ${taskData.workspaceName}
          Assigned by: ${taskData.assignedBy}
          Priority: ${taskData.priority}
          ${taskData.dueDate ? `Due Date: ${taskData.dueDate}` : ""}
          ${taskData.description ? `Description: ${taskData.description}` : ""}

          View Task Details: ${taskUrl}

          © ${new Date().getFullYear()} KarmaKanban
        `,
      };

      await this.transporter.sendMail(mailOptions);

      return true;
    } catch (error) {
      console.error("❌ Error sending task assigned email:", error);
      return false;
    }
  }

  async sendWorkspaceInviteEmail(
    to: string,
    inviteData: {
      workspaceName: string;
      inviterName: string;
      inviteCode: string;
    }
  ): Promise<boolean> {
    try {
      const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/workspaces/join?code=${inviteData.inviteCode}`;

      const mailOptions = {
        from: '"KarmaKanban" <soportekarmakanban@gmail.com>',
        to: to,
        subject: `Invitation to join ${inviteData.workspaceName} workspace`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .invite-card { background: white; border: 2px dashed #059669; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
                .cta-button { background: #059669; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
                .invite-code { font-family: monospace; font-size: 18px; font-weight: bold; background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 You&apos;re Invited!</h1>
                  <p>KarmaKanban</p>
                </div>
                <div class="content">
                  <h2>Join ${inviteData.workspaceName}</h2>
                  <p><strong>${
                    inviteData.inviterName
                  }</strong> has invited you to collaborate in the <strong>${
          inviteData.workspaceName
        }</strong> workspace on KarmaKanban!</p>

                  <div class="invite-card">
                    <h3 style="color: #059669; margin: 0 0 15px 0;">🚀 Get Started</h3>
                    <p>Click the button below to join the workspace and start collaborating with your team!</p>
                    
                    <a href="${inviteUrl}" class="cta-button">Join Workspace</a>
                    
                    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">Or use the invite code manually:</p>
                    <div class="invite-code">${inviteData.inviteCode}</div>
                  </div>

                  <div style="background: #e0f2fe; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
                    <h4 style="margin: 0 0 10px 0; color: #0284c7;">What is KarmaKanban?</h4>
                    <p style="margin: 0;">A gamified project management platform where you can track tasks, earn points, unlock achievements, and collaborate effectively with your team!</p>
                  </div>
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
          KarmaKanban - Workspace Invitation

          You're invited to join ${inviteData.workspaceName}!

          ${inviteData.inviterName} has invited you to collaborate in the ${
          inviteData.workspaceName
        } workspace.

          Join using this link: ${inviteUrl}
          
          Or use the invite code: ${inviteData.inviteCode}

          Visit ${process.env.NEXT_PUBLIC_APP_URL} to get started.

          © ${new Date().getFullYear()} KarmaKanban
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending workspace invite email:", error);
      return false;
    }
  }

  async sendStoreRedemptionRequestEmail(
    to: string,
    requestData: {
      requesterName: string;
      itemName: string;
      pointsCost: number;
      workspaceName: string;
      notes?: string;
      workspaceId: string;
    }
  ): Promise<boolean> {
    try {
      const mailOptions = {
        from: '"KarmaKanban" <soportekarmakanban@gmail.com>',
        to: to,
        subject: `New Redemption Request: ${requestData.itemName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .request-card { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .points-badge { background: #f59e0b; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; }
                .cta-button { background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🛒 New Redemption Request</h1>
                  <p>KarmaKanban</p>
                </div>
                <div class="content">
                  <h2>Action Required: Review Redemption Request</h2>
                  <p>A team member has requested to redeem an item from the workspace store.</p>

                  <div class="request-card">
                    <h3 style="margin: 0 0 15px 0; color: #f59e0b;">📦 ${
                      requestData.itemName
                    }</h3>
                    <p><strong>Requested by:</strong> ${
                      requestData.requesterName
                    }</p>
                    <p><strong>Workspace:</strong> ${
                      requestData.workspaceName
                    }</p>
                    <p><strong>Points Cost:</strong> <span class="points-badge">${
                      requestData.pointsCost
                    } pts</span></p>
                    ${
                      requestData.notes
                        ? `<p><strong>Notes:</strong> ${requestData.notes}</p>`
                        : ""
                    }
                  </div>

                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/workspaces/${
          requestData.workspaceId
        }/store" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold;" target="_blank" rel="noopener noreferrer">Review Request</a>

                  <p>Please review and approve or reject this redemption request in your dashboard.</p>
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
          KarmaKanban - New Redemption Request

          Action Required: Review Redemption Request

          Item: ${requestData.itemName}
          Requested by: ${requestData.requesterName}
          Workspace: ${requestData.workspaceName}
          Points Cost: ${requestData.pointsCost} pts
          ${requestData.notes ? `Notes: ${requestData.notes}` : ""}

          Review this request at: ${
            process.env.NEXT_PUBLIC_APP_URL
          }/workspaces/${requestData.workspaceId}/store

          © ${new Date().getFullYear()} KarmaKanban
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending store redemption request email:", error);
      return false;
    }
  }

  async sendRedemptionStatusEmail(
    to: string,
    statusData: {
      itemName: string;
      status: "approved" | "rejected";
      workspaceName: string;
      reviewerName: string;
      reviewNotes?: string;
      workspaceId: string;
    }
  ): Promise<boolean> {
    try {
      const isApproved = statusData.status === "approved";
      const statusColor = isApproved ? "#059669" : "#dc2626";
      const statusIcon = isApproved ? "✅" : "❌";
      const statusText = isApproved ? "Approved" : "Rejected";

      const mailOptions = {
        from: '"KarmaKanban" <soportekarmakanban@gmail.com>',
        to: to,
        subject: `Redemption ${statusText}: ${statusData.itemName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .status-card { background: white; border-left: 4px solid ${statusColor}; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .status-badge { background: ${statusColor}; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; }
                .cta-button { background: ${statusColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
                .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>${statusIcon} Redemption ${statusText}</h1>
                  <p>KarmaKanban</p>
                </div>
                <div class="content">
                  <h2>Your redemption request has been ${statusText.toLowerCase()}</h2>
                  
                  <div class="status-card">
                    <h3 style="margin: 0 0 15px 0; color: ${statusColor};">📦 ${
          statusData.itemName
        }</h3>
                    <p><strong>Status:</strong> <span class="status-badge">${statusText}</span></p>
                    <p><strong>Workspace:</strong> ${
                      statusData.workspaceName
                    }</p>
                    <p><strong>Reviewed by:</strong> ${
                      statusData.reviewerName
                    }</p>
                    ${
                      statusData.reviewNotes
                        ? `<p><strong>Notes:</strong> ${statusData.reviewNotes}</p>`
                        : ""
                    }
                  </div>

                  ${
                    isApproved
                      ? `<p>🎉 Great news! Your redemption request has been approved. You should receive your reward soon!</p>`
                      : `<p>Unfortunately, your redemption request has been rejected. Please contact your project manager for more details.</p>`
                  }

                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/workspaces/${
          statusData.workspaceId
        }/store" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold;" target="_blank" rel="noopener noreferrer">View Store</a>
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
          KarmaKanban - Redemption ${statusText}

          Your redemption request has been ${statusText.toLowerCase()}

          Item: ${statusData.itemName}
          Status: ${statusText}
          Workspace: ${statusData.workspaceName}
          Reviewed by: ${statusData.reviewerName}
          ${statusData.reviewNotes ? `Notes: ${statusData.reviewNotes}` : ""}

          View Store: ${process.env.NEXT_PUBLIC_APP_URL}/workspaces/${
          statusData.workspaceId
        }/store

          © ${new Date().getFullYear()} KarmaKanban
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("Error sending redemption status email:", error);
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
