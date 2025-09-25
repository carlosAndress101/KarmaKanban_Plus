import { emailService } from "./email-service";

export class NotificationService {
  /**
   * Send notification when a task is assigned to a user
   */
  static async sendTaskAssignedNotification(
    assigneeEmail: string,
    taskData: {
      taskName: string;
      projectName: string;
      workspaceName: string;
      assignedByName: string;
      priority: string;
      dueDate?: Date;
      description?: string;
    }
  ): Promise<boolean> {
    try {
      const formattedData = {
        ...taskData,
        assignedBy: taskData.assignedByName,
        dueDate: taskData.dueDate
          ? taskData.dueDate.toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
      };

      return await emailService.sendTaskAssignedEmail(
        assigneeEmail,
        formattedData
      );
    } catch (error) {
      console.error("Error sending task assigned notification:", error);
      return false;
    }
  }

  /**
   * Send notification when a user is invited to a workspace
   */
  static async sendWorkspaceInviteNotification(
    inviteeEmail: string,
    inviteData: {
      workspaceName: string;
      inviterName: string;
      inviteCode: string;
    }
  ): Promise<boolean> {
    try {
      return await emailService.sendWorkspaceInviteEmail(
        inviteeEmail,
        inviteData
      );
    } catch (error) {
      console.error("Error sending workspace invite notification:", error);
      return false;
    }
  }

  /**
   * Send notification to project managers when someone requests to redeem a store item
   */
  static async sendStoreRedemptionRequestNotification(
    projectManagerEmails: string[],
    requestData: {
      requesterName: string;
      itemName: string;
      pointsCost: number;
      workspaceName: string;
      notes?: string;
    }
  ): Promise<boolean> {
    try {
      const results = await Promise.all(
        projectManagerEmails.map((email) =>
          emailService.sendStoreRedemptionRequestEmail(email, requestData)
        )
      );

      // Return true if at least one email was sent successfully
      return results.some((result) => result === true);
    } catch (error) {
      console.error(
        "Error sending store redemption request notifications:",
        error
      );
      return false;
    }
  }

  /**
   * Send notification when a redemption request is approved or rejected
   */
  static async sendRedemptionStatusNotification(
    requesterEmail: string,
    statusData: {
      itemName: string;
      status: "approved" | "rejected";
      workspaceName: string;
      reviewerName: string;
      reviewNotes?: string;
    }
  ): Promise<boolean> {
    try {
      return await emailService.sendRedemptionStatusEmail(
        requesterEmail,
        statusData
      );
    } catch (error) {
      console.error("Error sending redemption status notification:", error);
      return false;
    }
  }
}
