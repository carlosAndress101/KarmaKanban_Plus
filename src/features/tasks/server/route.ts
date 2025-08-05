import { z } from "zod";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import { getMember } from "@/features/members/utils";
import { sessionMiddleware } from "@/lib/session";

import { BulkUpdateTasksSchema, taskSchema } from "../schemas";
import { TaskStatus, TaskDifficulty } from "../types";
import { members, projects, tasks, users } from "@/lib/schemas_drizzle";
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
        difficulty: z.nativeEnum(TaskDifficulty).nullish(),
      })
    ),
    async (c) => {
      const user = c.get("user");

      if (!user) return c.json({ error: "user required" }, 400);

      const { workspaceId, assigneeId, dueDate, projectId, search, status, difficulty} =
        c.req.valid("query");

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

      if (difficulty) {
        whereConditions.push(eq(tasks.difficulty, difficulty));
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
          assigneeName: users.name,
          assigneeLastName: users.lastName,
          projectName: projects.name,
          difficulty: tasks.difficulty, // <-- Agrega esto
        })
        .from(tasks)
        .leftJoin(projects, eq(tasks.projectId, projects.id))
        .leftJoin(members, eq(tasks.assigneeId, members.id))
        .leftJoin(users, eq(members.userId, users.id))
        .where(and(...whereConditions))
        .orderBy(desc(tasks.createdAt));

      // Formatear la respuesta para que coincida con tu estructura original
      const formattedTasks = populatedTasks.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        status: row.status,
        dueDate: row.dueDate,
        assignee: {
          id: row.assigneeId,
          name: row.assigneeName,
          lastName: row.assigneeLastName,
        },
        project: {
          id: row.projectId,
          name: row.projectName,
        },
        workspaceId: row.workspaceId,
        position: row.position,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        difficulty: row.difficulty, // <-- Agrega esto
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

      const { assignee, dueDate, name, project, status, workspaceId, description, difficulty } = c.req.valid("json");

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
          description,
          difficulty
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
        difficulty: Task.difficulty, // <-- Agrega esto
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
    const [task] = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!task) {
      return c.json({ error: "Task not found" }, 404);
    }

    const [member] = await db
      .select()
      .from(members)
      .where(
        and(
          eq(members.userId, user.id),
          eq(members.workspaceId, task.workspaceId)
        )
      )
      .limit(1);

    if (!member) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, task.projectId))
      .limit(1);

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    if (!task.assigneeId) {
      return c.json({ error: "Task has no assignee" }, 400);
    }

    const [assigneeMember] = await db
      .select()
      .from(members)
      .where(eq(members.id, task.assigneeId))
      .limit(1);

    if (!assigneeMember) {
      return c.json({ error: "Assignee not found" }, 404);
    }

    const [assigneeUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, assigneeMember.userId))
      .limit(1);

    const assignee = {
      ...assigneeMember,
      name: assigneeUser.name,
      email: assigneeUser.email,
      createdAt: new Date(assigneeMember.createdAt),
      updatedAt: new Date(assigneeMember.updatedAt),
    }

    return c.json({
      data: {
        ...task,
        description: task.description ?? undefined,
        status: TaskStatus[task.status as keyof typeof TaskStatus],
        dueDate: task.dueDate ?? "",
        project,
        assignee,
        difficulty: task.difficulty, // <-- Agrega esto
      }
    })
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
      
      console.log('Member processing points:', {
        memberId: member.id,
        userId: user.id,
        workspaceId: [...workspaceIds][0],
        currentPoints: member.points
      });

      // Calculate points for tasks moving to DONE status
      // Group points by assignee to award points to the correct members
      const pointsByAssignee = new Map<string, number>();
      
      console.log('=== POINTS CALCULATION DEBUG ===');
      console.log('Updates received:', updates.length);
      console.log('Existing tasks:', existingTasks.length);
      
      for (const update of updates) {
        const existingTask = existingTasks.find(t => t.id === update.id);
        console.log(`Task ${update.id}:`);
        console.log('  - Existing status:', existingTask?.status);
        console.log('  - New status:', update.status);
        console.log('  - Difficulty:', existingTask?.difficulty);
        console.log('  - Assignee:', existingTask?.assigneeId);
        
        if (existingTask && existingTask.status !== "DONE" && update.status === "DONE" && existingTask.assigneeId) {
          let taskPoints = 0;
          // Award points based on difficulty
          switch (existingTask.difficulty) {
            case "Facil":
              taskPoints = 10;
              break;
            case "Medio":
              taskPoints = 20;
              break;
            case "Dificil":
              taskPoints = 30;
              break;
          }
          
          if (taskPoints > 0) {
            const currentPoints = pointsByAssignee.get(existingTask.assigneeId) || 0;
            pointsByAssignee.set(existingTask.assigneeId, currentPoints + taskPoints);
            console.log(`  - Points awarded: ${taskPoints} to assignee ${existingTask.assigneeId}`);
          }
        } else {
          console.log('  - No points awarded (not moving to DONE, already DONE, or no assignee)');
        }
      }
      
      console.log('Points by assignee:', Object.fromEntries(pointsByAssignee));
      console.log('================================');

      // Update tasks
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

      // Update member points for each assignee that earned points
      let totalPointsAwarded = 0;
      for (const [assigneeId, points] of pointsByAssignee) {
        // Get the current points for this member
        const [assigneeMember] = await db
          .select()
          .from(members)
          .where(eq(members.id, assigneeId))
          .limit(1);
          
        if (assigneeMember) {
          await db
            .update(members)
            .set({
              points: assigneeMember.points ? assigneeMember.points + points : points,
              updatedAt: new Date(),
            })
            .where(eq(members.id, assigneeId));
          
          totalPointsAwarded += points;
          console.log(`Updated member ${assigneeId} with ${points} points (total: ${assigneeMember.points ? assigneeMember.points + points : points})`);
        }
      }

      return c.json({ data: updated, pointsAwarded: totalPointsAwarded });
    }
  );


export default app;
