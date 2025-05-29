import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session";

import { BulkUpdateTasksSchema, taskSchema } from "../schemas";
import { TaskStatus } from "../types";
import { members, projects, tasks } from "@/lib/schemas_drizzle";
import { and, eq, desc, inArray, like } from "drizzle-orm";
import { db } from "@/lib/drizzle";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator(
      "query",
      z.object({
        workspaceId: z.string(),
        projectId: z.string().nullish(),
        assigneeId: z.string().nullish(),
        status: z.nativeEnum(TaskStatus).nullish(),
        search: z.string().nullish(),
        dueDate: z.string().nullish(),
      })
    ),
    async (c) => {
      const user = c.get("user");

      if (!user) return c.json({ error: "user required" }, 400);

      const { workspaceId, assigneeId, dueDate, projectId, search, status } =
        c.req.valid("query");

      if (!projectId) {
        return c.json({ error: "ProjectId required" }, 400);
      }

      const [member] = await getMember(workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Construir condiciones WHERE
      const whereConditions = [eq(tasks.workspaceId, workspaceId)];

      if (projectId) {
        whereConditions.push(eq(tasks.projectId, projectId));
      }

      if (assigneeId) {
        whereConditions.push(eq(tasks.assigneeId, assigneeId));
      }

      if (status) {
        whereConditions.push(eq(tasks.status, status));
      }

      if (dueDate) {
        whereConditions.push(eq(tasks.dueDate, new Date(dueDate)));
      }

      // Agregar búsqueda por nombre directamente en la query
      if (search) {
        whereConditions.push(
          like(tasks.name, `%${search.toLowerCase()}%`)
        );
      }

      // Query optimizada con JOIN para obtener todo en una sola consulta
      const populatedTasks = await db
        .select({
          // Campos de task
          id: tasks.id,
          name: tasks.name,
          description: tasks.description,
          status: tasks.status,
          dueDate: tasks.dueDate,
          assigneeId: tasks.assigneeId,
          projectId: tasks.projectId,
          workspaceId: tasks.workspaceId,
          position: tasks.position,
          createdAt: tasks.createdAt,
          updatedAt: tasks.updatedAt,

        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projectId))
        .leftJoin(members, eq(tasks.assigneeId, members.id))
        .where(and(...whereConditions))
        .orderBy(desc(tasks.createdAt));

      // Formatear la respuesta para que coincida con tu estructura original
      const formattedTasks = populatedTasks.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        dueDate: row.dueDate,
        assignee: row.assigneeId,
        project: row.projectId,
        workspaceId: row.workspaceId,
        position: row.position,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }));

      return c.json({ data: { documents: formattedTasks } });
    }
  )
  .post(
    "/",
    sessionMiddleware,
    zValidator("json", taskSchema),
    async (c) => {
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { assignee, dueDate, name, project, status, workspaceId, description } = c.req.valid("json");

      const [member] = await getMember(workspaceId, user.id)

      if (!member) return c.json({ error: "Unauthorized" }, 401);

      // Buscar tarea con mayor posición en ese workspace + estado
      const [highestTask] = await db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.workspaceId, workspaceId),
            eq(tasks.status, status)
          )
        )
        .orderBy(desc(tasks.position))
        .limit(1)

      const newPosition = highestTask ? highestTask.position + 1000 : 1000

      // Crear nueva tarea
      const [Task] = await db
        .insert(tasks)
        .values({
          name,
          status,
          workspaceId,
          projectId: project,
          dueDate: dueDate ? new Date(dueDate) : undefined,
          assigneeId: assignee,
          position: newPosition,
          description
        })
        .returning()

      // Formatear la respuesta igual que en el GET
      const formattedTask = {
        id: Task.id,
        name: Task.name,
        description: Task.description,
        status: Task.status,
        dueDate: Task.dueDate,
        assignee: Task.assigneeId,
        project: Task.projectId,
        workspaceId: Task.workspaceId,
        createdAt: Task.createdAt,
        updatedAt: Task.updatedAt,
      };

      return c.json({ data: formattedTask });
    }
  )
  .patch(
    "/:taskId",
    sessionMiddleware,
    zValidator("json", taskSchema.partial()),
    async (c) => {
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { taskId } = c.req.param();
      const values = c.req.valid("json");

      const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
      if (!task) return c.json({ error: "Task not found" }, 404);

      const [member] = await getMember(task.workspaceId, user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      const [updatedTask] = await db
        .update(tasks)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(tasks.id, taskId))
        .returning();

      return c.json({ data: updatedTask });
    }
  )
  .delete("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { taskId } = c.req.param();

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) return c.json({ error: "Task not found" }, 404);

    const [member] = await getMember(task.workspaceId, user.id);
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    await db.delete(tasks).where(eq(tasks.id, taskId));

    return c.json({ data: { id: taskId } });
  })
  .get("/:taskId", sessionMiddleware, async (c) => {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { taskId } = c.req.param();

    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
    if (!task) return c.json({ error: "Task not found" }, 404);

    const [member] = await getMember(task.workspaceId, user.id);
    if (!member) return c.json({ error: "Unauthorized" }, 401);

    return c.json({
      data: {
        ...task,
        assigneedId: task.assigneeId ?? undefined,
        description: task.description ?? undefined,
        project: task.projectId ?? undefined,
        assignee: task.assigneeId ?? undefined,
      }
    });
  })
  .post(
    "/bulk-update", sessionMiddleware, zValidator("json", BulkUpdateTasksSchema), async (c) => {
      
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const { tasks: updates } = c.req.valid("json");

      const ids = updates.map((t) => t.id);
      const existingTasks = await db.select().from(tasks).where(inArray(tasks.id, ids));

      const workspaceIds = new Set(existingTasks.map((t) => t.workspaceId));
      if (workspaceIds.size !== 1) {
        return c.json({ error: "Todas las tareas deben pertenecer al mismo espacio de trabajo" });
      }

      const [member] = await getMember([...workspaceIds][0], user.id);
      if (!member) return c.json({ error: "Unauthorized" }, 401);

      const updated = await Promise.all(
        updates.map((update) =>
          db
            .update(tasks)
            .set({
              status: update.status,
              position: update.position,
              updatedAt: new Date(),
            })
            .where(eq(tasks.id, update.id))
        )
      );

      return c.json({ data: updated });
    }
  );


export default app;
