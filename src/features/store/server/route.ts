import { Hono } from "hono";
import { eq, desc, and, asc, sql } from "drizzle-orm";
import { db } from "@/lib/drizzle";
import { storeItems, redemptionRequests, members, users } from "@/lib/schemas_drizzle";
import { sessionMiddleware } from "@/lib/session";
import { getMember } from "@/features/members/utils";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

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
  })

  .post(
    "/",
    sessionMiddleware,
    zValidator("json", z.object({
      workspaceId: z.string(),
      name: z.string().min(1, "Name is required"),
      description: z.string().min(1, "Description is required"),
      pointsCost: z.number().min(1, "Points cost must be at least 1"),
      category: z.enum(["Physical", "Digital", "Experience", "Perk"]),
      stock: z.number().optional(),
      imageUrl: z.string().url().optional().or(z.literal("")),
    })),
    async (c) => {
      const user = c.get("user");
      if (!user) return c.json({ error: "Unauthorized" }, 401);
      
      const { workspaceId, ...data } = c.req.valid("json");
      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Only Project Managers and admins can create store items
      if (member.role !== "admin" && member.gamificationRole !== "Project Manager") {
        return c.json({ error: "Unauthorized. Only Project Managers and admins can manage store items." }, 403);
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
    zValidator("param", z.object({
      storeItemId: z.string(),
    })),
    zValidator("json", z.object({
      name: z.string().min(1).optional(),
      description: z.string().min(1).optional(),
      pointsCost: z.number().min(1).optional(),
      category: z.enum(["Physical", "Digital", "Experience", "Perk"]).optional(),
      stock: z.number().optional(),
      imageUrl: z.string().url().optional(),
      isActive: z.boolean().optional(),
    })),
    async (c) => {
      const member = c.get("member");
      const workspaceId = c.get("workspaceId");
      const { storeItemId } = c.req.valid("param");
      const data = c.req.valid("json");

      // Only Project Managers and admins can update store items
      if (member.role !== "admin" && member.gamificationRole !== "Project Manager") {
        return c.json({ error: "Unauthorized. Only Project Managers and admins can manage store items." }, 403);
      }

      const [item] = await db
        .update(storeItems)
        .set(data)
        .where(
          and(
            eq(storeItems.id, storeItemId),
            eq(storeItems.workspaceId, workspaceId)
          )
        )
        .returning();

      if (!item) {
        return c.json({ error: "Store item not found" }, 404);
      }

      return c.json({ data: item });
    }
  )

  .delete(
    "/:storeItemId",
    sessionMiddleware,
    zValidator("param", z.object({
      storeItemId: z.string(),
    })),
    async (c) => {
      const member = c.get("member");
      const workspaceId = c.get("workspaceId");
      const { storeItemId } = c.req.valid("param");

      // Only Project Managers and admins can delete store items
      if (member.role !== "admin" && member.gamificationRole !== "Project Manager") {
        return c.json({ error: "Unauthorized. Only Project Managers and admins can manage store items." }, 403);
      }

      const [item] = await db
        .delete(storeItems)
        .where(
          and(
            eq(storeItems.id, storeItemId),
            eq(storeItems.workspaceId, workspaceId)
          )
        )
        .returning();

      if (!item) {
        return c.json({ error: "Store item not found" }, 404);
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
      const isManager = member.role === "admin" || member.gamificationRole === "Project Manager";
    
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
        requesterName: sql`CONCAT(${users.name}, ' ', ${users.lastName})`,
        requesterEmail: users.email,
        itemName: storeItems.name,
        itemDescription: storeItems.description,
        itemCategory: storeItems.category,
        reviewerName: sql`CONCAT(reviewer_users.name, ' ', reviewer_users.lastName)`,
      })
      .from(redemptionRequests)
      .innerJoin(members, eq(redemptionRequests.requesterId, members.id))
      .innerJoin(users, eq(members.userId, users.id))
      .innerJoin(storeItems, eq(redemptionRequests.storeItemId, storeItems.id))
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
          isManager ? undefined : eq(redemptionRequests.requesterId, member.id)
        )
      )
      .orderBy(desc(redemptionRequests.createdAt));

    return c.json({ data: requests });
  })

  .post(
    "/redemptions",
    sessionMiddleware,
    zValidator("json", z.object({
      workspaceId: z.string(),
      storeItemId: z.string(),
      notes: z.string().optional(),
    })),
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
      if (member.points < item.pointsCost) {
        return c.json({ error: "Insufficient points" }, 400);
      }

      // Check stock if limited
      if (item.stock !== null && item.stock <= 0) {
        return c.json({ error: "Item out of stock" }, 400);
      }

      // Create redemption request and deduct points
      await db.transaction(async (tx) => {
        // Deduct points from user
        await tx
          .update(members)
          .set({ 
            points: member.points - item.pointsCost 
          })
          .where(eq(members.id, member.id));

        // Create redemption request
        await tx
          .insert(redemptionRequests)
          .values({
            workspaceId,
            requesterId: member.id,
            storeItemId,
            pointsSpent: item.pointsCost,
            notes,
          });

        // Update stock if limited
        if (item.stock !== null) {
          await tx
            .update(storeItems)
            .set({ stock: item.stock - 1 })
            .where(eq(storeItems.id, storeItemId));
        }
      });

      return c.json({ data: { message: "Redemption request created successfully" } });
    }
  )

  .patch(
    "/redemptions/:requestId",
    sessionMiddleware,
    zValidator("param", z.object({
      requestId: z.string(),
    })),
    zValidator("json", z.object({
      status: z.enum(["approved", "rejected", "fulfilled"]),
      adminNotes: z.string().optional(),
    })),
    async (c) => {
      const member = c.get("member");
      const workspaceId = c.get("workspaceId");
      const { requestId } = c.req.valid("param");
      const { status, adminNotes } = c.req.valid("json");

      // Only Project Managers and admins can review requests
      if (member.role !== "admin" && member.gamificationRole !== "Project Manager") {
        return c.json({ error: "Unauthorized. Only Project Managers and admins can review redemption requests." }, 403);
      }

      // Get the current request
      const [currentRequest] = await db
        .select({
          id: redemptionRequests.id,
          status: redemptionRequests.status,
          pointsSpent: redemptionRequests.pointsSpent,
          requesterId: redemptionRequests.requesterId,
          storeItemId: redemptionRequests.storeItemId,
        })
        .from(redemptionRequests)
        .where(
          and(
            eq(redemptionRequests.id, requestId),
            eq(redemptionRequests.workspaceId, workspaceId)
          )
        );

      if (!currentRequest) {
        return c.json({ error: "Redemption request not found" }, 404);
      }

      // Handle status transitions
      const shouldRefundPoints = currentRequest.status === "pending" && status === "rejected";

      await db.transaction(async (tx) => {
        // Update the request
        await tx
          .update(redemptionRequests)
          .set({
            status,
            adminNotes,
            reviewedBy: member.id,
            reviewedAt: new Date(),
          })
          .where(eq(redemptionRequests.id, requestId));

        // Refund points if rejected
        if (shouldRefundPoints) {
          await tx
            .update(members)
            .set(sql`points = points + ${currentRequest.pointsSpent}`)
            .where(eq(members.id, currentRequest.requesterId));

          // Also restore stock if applicable
          const [item] = await tx
            .select({ stock: storeItems.stock })
            .from(storeItems)
            .where(eq(storeItems.id, currentRequest.storeItemId));

          if (item && item.stock !== null) {
            await tx
              .update(storeItems)
              .set({ stock: item.stock + 1 })
              .where(eq(storeItems.id, currentRequest.storeItemId));
          }
        }
      });

      return c.json({ data: { message: "Redemption request updated successfully" } });
    }
  );

export default app;
