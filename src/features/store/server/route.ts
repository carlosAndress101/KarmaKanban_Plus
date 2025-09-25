import { Hono } from "hono";
import { eq, desc, and, asc, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle";
import {
  storeItems,
  redemptionRequests,
  members,
  users,
  workspaces,
} from "@/lib/schemas_drizzle";
import { sessionMiddleware } from "@/lib/session";
import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { NotificationService } from "@/lib/email/notification-service";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { workspaceId } = c.req.valid("query");
      if (!workspaceId || workspaceId === "undefined") {
        return c.json({ error: "Missing or invalid workspaceId" }, 400);
      }
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      const items = await db
        .select()
        .from(storeItems)
        .where(
          and(
            eq(storeItems.workspaceId, workspaceId),
            eq(storeItems.isActive, true)
          )
        )
        .orderBy(asc(storeItems.category), asc(storeItems.pointsCost));

      return c.json({ data: items });
    }
  )

  .post(
    "/",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        workspaceId: z.string(),
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        pointsCost: z.number().min(1, "Points cost must be at least 1"),
        category: z.enum(["Physical", "Digital", "Experience", "Perk"]),
        stock: z.number().optional(),
        imageUrl: z.string().url().optional().or(z.literal("")),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { workspaceId, ...data } = c.req.valid("json");
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Only Project Managers and admins can create store items
      if (
        member.role !== "admin" &&
        member.gamificationRole !== "Project Manager"
      ) {
        return c.json(
          {
            error:
              "Unauthorized. Only Project Managers and admins can manage store items.",
          },
          403
        );
      }

      const [item] = await db
        .insert(storeItems)
        .values({
          workspaceId,
          ...data,
        })
        .returning();

      return c.json({ data: item });
    }
  )

  .patch(
    "/:storeItemId",
    sessionMiddleware,
    zValidator(
      "param",
      z.object({
        storeItemId: z.string(),
      })
    ),
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        pointsCost: z.number().min(1).optional(),
        category: z
          .enum(["Physical", "Digital", "Experience", "Perk"])
          .optional(),
        stock: z.number().optional(),
        imageUrl: z.string().url().optional(),
        isActive: z.boolean().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const { storeItemId } = c.req.valid("param");
      let data;
      try {
        data = c.req.valid("json");
      } catch (err) {
        console.error(
          "[PATCH /store/:storeItemId] JSON validation error:",
          err
        );
        return c.json(
          {
            error:
              "Invalid data: " +
              (typeof err === "object" && err !== null && "message" in err
                ? (err as { message?: string }).message
                : String(err)),
          },
          400
        );
      }
      // workspaceId must be inferred from the store item
      // Get the store item first
      const [item] = await db
        .select()
        .from(storeItems)
        .where(eq(storeItems.id, storeItemId));
      if (!item) {
        return c.json({ error: "Store item not found" }, 404);
      }
      const workspaceId = item.workspaceId;
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);
      // Only Project Managers and admins can update store items
      if (
        member.role !== "admin" &&
        member.gamificationRole !== "Project Manager"
      ) {
        return c.json(
          {
            error:
              "Unauthorized. Only Project Managers and admins can manage store items.",
          },
          403
        );
      }
      const updated = await db
        .update(storeItems)
        .set(data)
        .where(
          and(
            eq(storeItems.id, storeItemId),
            eq(storeItems.workspaceId, workspaceId)
          )
        )
        .returning();
      if (!updated || updated.length === 0) {
        return c.json({ error: "Store item not found or not updated" }, 404);
      }
      return c.json({ data: updated[0] });
    }
  )

  .delete(
    "/:storeItemId",
    sessionMiddleware,
    zValidator(
      "param",
      z.object({
        storeItemId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const { storeItemId } = c.req.valid("param");
      // Get the store item first
      const [item] = await db
        .select()
        .from(storeItems)
        .where(eq(storeItems.id, storeItemId));
      if (!item) {
        return c.json({ error: "Store item not found" }, 404);
      }
      const workspaceId = item.workspaceId;
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);
      // Only Project Managers and admins can delete store items
      if (
        member.role !== "admin" &&
        member.gamificationRole !== "Project Manager"
      ) {
        return c.json(
          {
            error:
              "Unauthorized. Only Project Managers and admins can manage store items.",
          },
          403
        );
      }
      const deleted = await db
        .delete(storeItems)
        .where(
          and(
            eq(storeItems.id, storeItemId),
            eq(storeItems.workspaceId, workspaceId)
          )
        )
        .returning();
      if (!deleted || deleted.length === 0) {
        return c.json({ error: "Store item not found or not deleted" }, 404);
      }
      return c.json({ data: { id: storeItemId } });
    }
  )

  // Redemption requests endpoints
  .get(
    "/redemptions",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { workspaceId } = c.req.valid("query");
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Project Managers and admins see all requests, others see only their own
      const isManager =
        member.role === "admin" ||
        member.gamificationRole === "Project Manager";

      const requests = await db
        .select({
          id: redemptionRequests.id,
          workspaceId: redemptionRequests.workspaceId,
          requesterId: redemptionRequests.requesterId,
          storeItemId: redemptionRequests.storeItemId,
          pointsSpent: redemptionRequests.pointsSpent,
          status: redemptionRequests.status,
          notes: redemptionRequests.notes,
          adminNotes: redemptionRequests.adminNotes,
          reviewedBy: redemptionRequests.reviewedBy,
          reviewedAt: redemptionRequests.reviewedAt,
          createdAt: redemptionRequests.createdAt,
          updatedAt: redemptionRequests.updatedAt,
          requesterName: sql`CONCAT(${users.name}, ' ', users.last_name)`,
          requesterEmail: users.email,
          itemName: storeItems.name,
          itemDescription: storeItems.description,
          itemCategory: storeItems.category,
          reviewerName: sql`CONCAT(reviewer_users.name, ' ', reviewer_users.last_name)`,
        })
        .from(redemptionRequests)
        .innerJoin(members, eq(redemptionRequests.requesterId, members.id))
        .innerJoin(users, eq(members.userId, users.id))
        .innerJoin(
          storeItems,
          eq(redemptionRequests.storeItemId, storeItems.id)
        )
        .leftJoin(
          sql`${members} AS reviewer_members`,
          eq(redemptionRequests.reviewedBy, sql`reviewer_members.id`)
        )
        .leftJoin(
          sql`${users} AS reviewer_users`,
          eq(sql`reviewer_members.user_id`, sql`reviewer_users.id`)
        )
        .where(
          and(
            eq(redemptionRequests.workspaceId, workspaceId),
            isManager
              ? undefined
              : eq(redemptionRequests.requesterId, member.id)
          )
        )
        .orderBy(desc(redemptionRequests.createdAt));

      return c.json({ data: requests });
    }
  )

  .post(
    "/redemptions",
    sessionMiddleware,
    zValidator(
      "json",
      z.object({
        workspaceId: z.string(),
        storeItemId: z.string(),
        notes: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);

      const { workspaceId, storeItemId, notes } = c.req.valid("json");
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Check if store item exists and get its cost
      const [item] = await db
        .select()
        .from(storeItems)
        .where(
          and(
            eq(storeItems.id, storeItemId),
            eq(storeItems.workspaceId, workspaceId),
            eq(storeItems.isActive, true)
          )
        );

      if (!item) {
        return c.json({ error: "Store item not found or inactive" }, 404);
      }

      // Check if user has enough points
      if (member.points == null) {
        return c.json({ error: "Member points is null or undefined" }, 500);
      }
      if (member.points < item.pointsCost) {
        return c.json({ error: "Insufficient points" }, 400);
      }

      // Check stock if limited
      if (item.stock !== null && item.stock <= 0) {
        return c.json({ error: "Item out of stock" }, 400);
      }

      // Create redemption request and deduct points

      // Deduct points from user

      if (member.points == null) {
        return c.json({ error: "Member points is null or undefined" }, 500);
      }

      const updatePointsResult = await db
        .update(members)
        .set({ points: member.points - item.pointsCost })
        .where(eq(members.id, member.id))
        .returning();

      if (!updatePointsResult || updatePointsResult.length === 0) {
        return c.json({ error: "Failed to deduct points from user" }, 500);
      }

      // Create redemption request
      const insertRedemptionResult = await db
        .insert(redemptionRequests)
        .values({
          workspaceId,
          requesterId: member.id,
          storeItemId,
          pointsSpent: item.pointsCost,
          notes,
        })
        .returning();

      if (!insertRedemptionResult || insertRedemptionResult.length === 0) {
        return c.json({ error: "Failed to create redemption request" }, 500);
      }

      // Update stock if limited
      if (item.stock !== null) {
        const updateStockResult = await db
          .update(storeItems)
          .set({ stock: item.stock - 1 })
          .where(eq(storeItems.id, storeItemId))
          .returning();
        if (!updateStockResult || updateStockResult.length === 0) {
          return c.json({ error: "Failed to update item stock" }, 500);
        }
      }

      // Send email notification to project managers and admins
      try {
        // Get workspace details and managers/admins
        const [workspace] = await db
          .select({ name: workspaces.name })
          .from(workspaces)
          .where(eq(workspaces.id, workspaceId));

        if (workspace) {
          // Get all project managers and admins in the workspace
          const managersAndAdmins = await db
            .select({
              email: users.email,
              name: sql`CONCAT(${users.name}, ' ', ${users.lastName})`.as(
                "fullName"
              ),
            })
            .from(members)
            .innerJoin(users, eq(members.userId, users.id))
            .where(
              and(
                eq(members.workspaceId, workspaceId),
                sql`(${members.role} = 'admin' OR ${members.gamificationRole} = 'Project Manager')`
              )
            );

          if (managersAndAdmins.length > 0) {
            const emails = managersAndAdmins.map((manager) => manager.email);
            await NotificationService.sendStoreRedemptionRequestNotification(
              emails,
              {
                requesterName:
                  user.name + (user.lastName ? ` ${user.lastName}` : ""),
                itemName: item.name,
                pointsCost: item.pointsCost,
                workspaceName: workspace.name,
                notes: notes || undefined,
                workspaceId: workspaceId,
              }
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to send store redemption request notification:",
          error
        );
        // Don't fail the request if email notification fails
      }

      return c.json({
        data: { message: "Redemption request created successfully" },
      });
    }
  )

  .patch(
    "/redemptions/:requestId",
    sessionMiddleware,
    zValidator(
      "param",
      z.object({
        requestId: z.string(),
      })
    ),
    zValidator(
      "json",
      z.object({
        status: z.enum(["approved", "rejected", "fulfilled"]),
        adminNotes: z.string().optional(),
      })
    ),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      const { requestId } = c.req.valid("param");
      const { status, adminNotes } = c.req.valid("json");
      // Get the current request
      const [currentRequest] = await db
        .select({
          id: redemptionRequests.id,
          status: redemptionRequests.status,
          pointsSpent: redemptionRequests.pointsSpent,
          requesterId: redemptionRequests.requesterId,
          storeItemId: redemptionRequests.storeItemId,
          workspaceId: redemptionRequests.workspaceId,
        })
        .from(redemptionRequests)
        .where(eq(redemptionRequests.id, requestId));
      if (!currentRequest) {
        return c.json({ error: "Redemption request not found" }, 404);
      }
      const workspaceId = currentRequest.workspaceId;
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);
      // Only Project Managers and admins can review requests
      if (
        member.role !== "admin" &&
        member.gamificationRole !== "Project Manager"
      ) {
        return c.json(
          {
            error:
              "Unauthorized. Only Project Managers and admins can review redemption requests.",
          },
          403
        );
      }
      // Handle status transitions
      const shouldRefundPoints =
        currentRequest.status === "pending" && status === "rejected";
      // Update the request
      const updateRequestResult = await db
        .update(redemptionRequests)
        .set({
          status,
          adminNotes,
          reviewedBy: member.id,
          reviewedAt: new Date(),
        })
        .where(eq(redemptionRequests.id, requestId))
        .returning();
      if (!updateRequestResult || updateRequestResult.length === 0) {
        return c.json({ error: "Failed to update redemption request" }, 500);
      }
      // Refund points if rejected
      if (shouldRefundPoints) {
        const refundResult = await db
          .update(members)
          .set({ points: sql`points + ${currentRequest.pointsSpent}` })
          .where(eq(members.id, currentRequest.requesterId))
          .returning();
        if (!refundResult || refundResult.length === 0) {
          return c.json({ error: "Failed to refund points" }, 500);
        }
        // Also restore stock if applicable
        const [item] = await db
          .select({ stock: storeItems.stock })
          .from(storeItems)
          .where(eq(storeItems.id, currentRequest.storeItemId));
        if (item && item.stock !== null) {
          const restoreStockResult = await db
            .update(storeItems)
            .set({ stock: item.stock + 1 })
            .where(eq(storeItems.id, currentRequest.storeItemId))
            .returning();
          if (!restoreStockResult || restoreStockResult.length === 0) {
            return c.json({ error: "Failed to restore item stock" }, 500);
          }
        }
      }

      // Send email notification to the requester about status change
      try {
        if (status === "approved" || status === "rejected") {
          // Get requester details and item details
          const [requesterDetails] = await db
            .select({
              email: users.email,
              requesterName:
                sql`CONCAT(${users.name}, ' ', ${users.lastName})`.as(
                  "requesterName"
                ),
            })
            .from(members)
            .innerJoin(users, eq(members.userId, users.id))
            .where(eq(members.id, currentRequest.requesterId));

          const [itemDetails] = await db
            .select({ name: storeItems.name })
            .from(storeItems)
            .where(eq(storeItems.id, currentRequest.storeItemId));

          const [workspaceDetails] = await db
            .select({ name: workspaces.name })
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId));

          if (requesterDetails && itemDetails && workspaceDetails) {
            await NotificationService.sendRedemptionStatusNotification(
              requesterDetails.email,
              {
                itemName: itemDetails.name,
                status: status as "approved" | "rejected",
                workspaceName: workspaceDetails.name,
                reviewerName:
                  user.name + (user.lastName ? ` ${user.lastName}` : ""),
                reviewNotes: adminNotes || undefined,
                workspaceId: workspaceId,
              }
            );
          }
        }
      } catch (error) {
        console.error("Failed to send redemption status notification:", error);
        // Don't fail the request if email notification fails
      }

      return c.json({
        data: { message: "Redemption request updated successfully" },
      });
    }
  );

export { app };
