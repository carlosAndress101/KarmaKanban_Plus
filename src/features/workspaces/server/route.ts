import { Hono } from "hono";
import { db } from "@/lib/drizzle";
import { getMember } from "../members/utils";
import { desc, eq, inArray, and, gte, not, lt, sql } from "drizzle-orm";
import { generateInviteCode } from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session";
import { members, tasks, userRoles, workspaces } from "@/lib/schemas_drizzle";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { z } from "zod";
import { TaskStatus } from "@/features/tasks/types";
import { subDays } from "date-fns";

const app = new Hono()
  .get("/", sessionMiddleware, async (c) => {
    const user = c.get("user");

    if (!user?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Obtener todos los workspace IDs en una sola consulta si no necesitas más del objeto members
    const workspaceIds = await db
      .select({ workspaceId: members.workspaceId })
      .from(members)
      .where(eq(members.userId, user.id));

    if (workspaceIds.length === 0) {
      return c.json({ data: [] });
    }

    const ids = workspaceIds.map((w) => w.workspaceId);

    // Obtener los workspaces ordenados por fecha de creación
    const workspaces_ = await db
      .select()
      .from(workspaces)
      .where(inArray(workspaces.id, ids))
      .orderBy(desc(workspaces.createdAt));

    return c.json({ data: workspaces_ });
  })
  .post(
    "/",
    zValidator("form", createWorkspaceSchema),
    sessionMiddleware,
    async (c) => {
      const user = c.get("user");
      const { name } = c.req.valid("form");

      if (!user || !user.id) {
        throw new Error("User is required");
      }

      const [workspace] = await db
        .insert(workspaces)
        .values({
          name,
          userId: user.id,
          inviteCode: generateInviteCode(6),
        })
        .returning({ id: workspaces.id });

      await db.insert(members).values({
        userId: user.id,
        workspaceId: workspace.id,
        role: userRoles[1],
      });

      return c.json({ data: workspace });
    }
  )
  .patch(
    "/:workspaceId",
    sessionMiddleware,
    zValidator("json", updateWorkspaceSchema),
    async (c) => {
      const user = c.get("user");
      if (!user || !user.id) {
        throw new Error("User is required");
      }
      const { name } = c.req.valid("json");
      const { workspaceId } = c.req.param();

      if (!workspaceId) {
        throw new Error("Workspace ID is required");
      }

      const [member] = await getMember(workspaceId, user.id);

      if (!member || member.role !== userRoles[1]) {
        return c.json(
          { error: "You don't have permission to update this workspace" },
          401
        );
      }

      const workspace = await db
        .update(workspaces)
        .set({ name, updatedAt: new Date() })
        .where(eq(workspaces.id, workspaceId))
        .returning({ id: workspaces.id });

      return c.json({ data: workspace });
    }
  )
  .get("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");

    if (!user || !user.id) {
      throw new Error("User is required");
    }

    const { workspaceId } = c.req.param();

    const member = await getMember(workspaceId, user.id);

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [workspace] = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId));

    return c.json({
      data: {
        id: workspace.id,
        name: workspace.name,
        inviteCode: workspace.inviteCode,
        userId: workspace.userId,
      },
    });
  })
  .delete("/:workspaceId", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    if (!user || !user.id) {
      throw new Error("User is required");
    }

    const [member] = await getMember(workspaceId, user.id);

    if (!member || member.role !== userRoles[1]) {
      return c.json(
        { error: "You don't have permission to delete this workspace" },
        401
      );
    }

    await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

    return c.json({ data: { id: workspaceId } });
  })
  .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
    const user = c.get("user");
    const { workspaceId } = c.req.param();

    if (!user || !user.id) {
      throw new Error("User is required");
    }

    const [member] = await getMember(workspaceId, user.id);

    if (!member || member.role !== userRoles[1]) {
      return c.json(
        { error: "You do not have permission to reset the invitation link" },
        401
      );
    }

    const workspace = await db
      .update(workspaces)
      .set({ inviteCode: generateInviteCode(6) })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return c.json({ data: workspace });
  })
  .post(
    "/:workspaceId/join",
    sessionMiddleware,
    zValidator("json", z.object({ inviteCode: z.string() })),
    async (c) => {
      const user = c.get("user");
      if (!user || !user.id) {
        throw new Error("User is required");
      }
      const { workspaceId } = c.req.param();
      const { inviteCode } = c.req.valid("json");

      const workspace = await db
        .select()
        .from(workspaces)
        .where(eq(workspaces.id, workspaceId));

      if (workspace[0].inviteCode !== inviteCode) {
        return c.json({ error: "Invalid invitation code" }, 400);
      }

      await db.insert(members).values({
        workspaceId,
        userId: user.id,
        role: userRoles[0],
      });

      return c.json({ data: workspace });
    }
  )
  .get(":workspaceId/analytics", sessionMiddleware, async (c) => {
    const { workspaceId } = c.req.param();
    const user = c.get("user");

    if (!user) return c.json({ error: "Unauthorized" }, 401);

    const [member] = await getMember(workspaceId, user.id);
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    const now = new Date();
    const oneWeekAgo = subDays(now, 7);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countTasks = async (whereClause: any) => {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(tasks)
        .where(whereClause);

      return result[0]?.count ?? 0;
    };

    // Contar todas las tareas actuales
    const taskCount = await countTasks(and(eq(tasks.workspaceId, workspaceId)));

    // Contar tareas creadas en la última semana para la diferencia
    const recentTaskCount = await countTasks(
      and(eq(tasks.workspaceId, workspaceId), gte(tasks.createdAt, oneWeekAgo))
    );

    // Asignadas al usuario actual
    const assignedTaskCount = await countTasks(
      and(eq(tasks.workspaceId, workspaceId), eq(tasks.assigneeId, member.id))
    );

    // Asignadas al usuario en la última semana
    const recentAssignedTaskCount = await countTasks(
      and(
        eq(tasks.workspaceId, workspaceId),
        eq(tasks.assigneeId, member.id),
        gte(tasks.createdAt, oneWeekAgo)
      )
    );

    // Completadas
    const completedTaskCount = await countTasks(
      and(eq(tasks.workspaceId, workspaceId), eq(tasks.status, TaskStatus.DONE))
    );

    // Completadas en la última semana
    const recentCompletedTaskCount = await countTasks(
      and(
        eq(tasks.workspaceId, workspaceId),
        eq(tasks.status, TaskStatus.DONE),
        gte(tasks.updatedAt, oneWeekAgo)
      )
    );

    // Incompletas
    const inCompleteTaskCount = await countTasks(
      and(
        eq(tasks.workspaceId, workspaceId),
        not(eq(tasks.status, TaskStatus.DONE))
      )
    );

    // Incompletas creadas en la última semana
    const recentInCompleteTaskCount = await countTasks(
      and(
        eq(tasks.workspaceId, workspaceId),
        not(eq(tasks.status, TaskStatus.DONE)),
        gte(tasks.createdAt, oneWeekAgo)
      )
    );

    // Vencidas
    const overDueTaskCount = await countTasks(
      and(
        eq(tasks.workspaceId, workspaceId),
        not(eq(tasks.status, TaskStatus.DONE)),
        lt(tasks.dueDate, now)
      )
    );

    // Vencidas en la última semana
    const recentOverDueTaskCount = await countTasks(
      and(
        eq(tasks.workspaceId, workspaceId),
        not(eq(tasks.status, TaskStatus.DONE)),
        lt(tasks.dueDate, now),
        gte(tasks.dueDate, oneWeekAgo)
      )
    );

    return c.json({
      data: {
        taskCount,
        taskDifference: recentTaskCount,
        assignedTaskCount,
        assignedTaskDifference: recentAssignedTaskCount,
        completedTaskCount,
        completedTaskDifference: recentCompletedTaskCount,
        inCompleteTaskCount,
        inCompleteTaskDifference: recentInCompleteTaskCount,
        overDueTaskCount,
        overDueTaskDifference: recentOverDueTaskCount,
      },
    });
  });

export default app;
