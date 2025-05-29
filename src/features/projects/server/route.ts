import { Hono } from "hono";
import { db } from "@/lib/drizzle";
import { and, eq, gte, lte, lt, ne, desc} from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session";
import { projects, tasks, userRoles } from "@/lib/schemas_drizzle";
import { z } from "zod";
import { getMember } from "@/features/workspaces/members/utils";
import { createProjectSchema, updateProjectSchema } from "../schemas";
import { endOfMonth, startOfMonth, subMonths } from "date-fns";

const app = new Hono()
    .get(
        "/",
        sessionMiddleware,
        zValidator("query", z.object({ workspaceId: z.string() })),
        async (c) => {

            const { workspaceId } = c.req.valid("query")
            const user = c.get("user")

            if (!user) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const member = await getMember(workspaceId, user.id)

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const projets = await db
                .select()
                .from(projects)
                .where(eq(projects.workspaceId, workspaceId))
                .orderBy(desc(projects.createdAt))

            return c.json({ data: projets });
        })
    .post(
        "/",
        sessionMiddleware,
        zValidator("form", createProjectSchema),
        async (c) => {
            const user = c.get("user");
            const { name, workspaceId } = c.req.valid("form")

            if (!user) {
                return c.json({ error: "Authentication required" }, 401);
            }

            const member = await getMember(workspaceId, user.id)

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const [project] = await db.insert(projects).values({
                name,
                workspaceId,
            }).returning()

            return c.json({ data: project });
        }
    )
    .get(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const { projectId } = c.req.param()
            const user = c.get("user")

            if (!user) {
                return c.json({ error: "Authentication required" }, 401);
            }

            const [project] = await db
                .select()
                .from(projects)
                .where(eq(projects.id, projectId))

            if (!project) {
                return c.json({ error: "Project not found" }, 404);
            }

            const member = await getMember(project.workspaceId, user.id)

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            return c.json({ data: project });
        }
    )
    .get(
        "/:projectId/analytics",
        sessionMiddleware,
        async (c) => {
            const { projectId } = c.req.param()
            const user = c.get("user")

            if (!user) {
                return c.json({ error: "Authentication required" }, 401);
            }

            const [project] = await db
                .select()
                .from(projects)
                .where(eq(projects.id, projectId))

            if (!project) {
                return c.json({ error: "Project not found" }, 404);
            }

            const [member] = await getMember(project.workspaceId, user.id)

            if (!member) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const now = new Date();
            const thisMonthStart = startOfMonth(now);
            const thisMonthEnd = endOfMonth(now);
            const lastMonthStart = startOfMonth(subMonths(now, 1));
            const lastMonthEnd = endOfMonth(subMonths(now, 1));

            const thisMonthTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        gte(tasks.createdAt, thisMonthStart),
                        lte(tasks.createdAt, thisMonthEnd)
                    )
                );

            const lastMonthTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        gte(tasks.createdAt, lastMonthStart),
                        lte(tasks.createdAt, lastMonthEnd)
                    )
                );

            const taskCount = thisMonthTasks.length;
            const taskDifference = taskCount - lastMonthTasks.length;

            const thisMonthAssignedTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        eq(tasks.assigneeId, member.id),
                        gte(tasks.createdAt, thisMonthStart),
                        lte(tasks.createdAt, thisMonthEnd)
                    )
                );

            const lastMonthAssignedTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        eq(tasks.assigneeId, member.id),
                        gte(tasks.createdAt, lastMonthStart),
                        lte(tasks.createdAt, lastMonthEnd)
                    )
                );

            const assignedTaskCount = thisMonthAssignedTasks.length;
            const assignedTaskDifference = assignedTaskCount - lastMonthAssignedTasks.length;

            const thisMonthInCompleteTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        ne(tasks.status, "DONE"),
                        gte(tasks.createdAt, thisMonthStart),
                        lte(tasks.createdAt, thisMonthEnd)
                    )
                );

            const lastMonthInCompleteTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        ne(tasks.status, "DONE"),
                        gte(tasks.createdAt, lastMonthStart),
                        lte(tasks.createdAt, lastMonthEnd)
                    )
                );

            const inCompleteTaskCount = thisMonthInCompleteTasks.length;
            const inCompleteTaskDifference = inCompleteTaskCount - lastMonthInCompleteTasks.length;

            const thisMonthCompletedTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        eq(tasks.status, "DONE"),
                        gte(tasks.createdAt, thisMonthStart),
                        lte(tasks.createdAt, thisMonthEnd)
                    )
                );

            const lastMonthCompletedTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        eq(tasks.status, "DONE"),
                        gte(tasks.createdAt, lastMonthStart),
                        lte(tasks.createdAt, lastMonthEnd)
                    )
                );

            const completedTaskCount = thisMonthCompletedTasks.length;
            const completedTaskDifference = completedTaskCount - lastMonthCompletedTasks.length;

            const thisMonthOverDueTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        ne(tasks.status, "DONE"),
                        lt(tasks.dueDate, now),
                        gte(tasks.createdAt, thisMonthStart),
                        lte(tasks.createdAt, thisMonthEnd)
                    )
                );

            const lastMonthOverDueTasks = await db
                .select()
                .from(tasks)
                .where(
                    and(
                        eq(tasks.projectId, projectId),
                        ne(tasks.status, "DONE"),
                        lt(tasks.dueDate, now),
                        gte(tasks.createdAt, lastMonthStart),
                        lte(tasks.createdAt, lastMonthEnd)
                    )
                );

            const overDueTaskCount = thisMonthOverDueTasks.length;
            const overDueTaskDifference = overDueTaskCount - lastMonthOverDueTasks.length;

            return c.json({
                data: {
                    taskCount,
                    taskDifference,
                    assignedTaskCount,
                    assignedTaskDifference,
                    completedTaskCount,
                    completedTaskDifference,
                    inCompleteTaskCount,
                    inCompleteTaskDifference,
                    overDueTaskCount,
                    overDueTaskDifference,
                },
            });
        }
    )
    .patch(
        "/:projectId",
        sessionMiddleware,
        zValidator("form", updateProjectSchema),
        async (c) => {
            const user = c.get("user")
            const { name } = c.req.valid("form");
            const { projectId } = c.req.param();

            if (!user) {
                throw new Error("User is required");
            }

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            const [member] = await getMember(projectId, user.id)

            if (!member || member.role !== userRoles[1]) {
                return c.json({ error: "tu no tienes permiso para actualizar este proyecto" }, 401)
            }

            const [project] = await db
                .update(projects)
                .set({ name, updatedAt: new Date() })
                .where(eq(projects.id, projectId))
                .returning({ id: projects.id })

            return c.json({ data: project })
        })
    .delete(
        "/:projectId",
        sessionMiddleware,
        async (c) => {
            const user = c.get("user")
            const { projectId } = c.req.param();

            if (!user) {
                throw new Error("User is required");
            }

            if (!projectId) {
                throw new Error("Project ID is required");
            }

            const existProject = await db
                .select()
                .from(projects)
                .where(eq(projects.id, projectId))

            if (existProject.length === 0) {
                return c.json({ error: "Project not found" }, 404);
            }

            const [member] = await getMember(existProject[0].workspaceId, user.id)

            if (!member || member.role !== userRoles[1]) {
                return c.json({ error: "tu no tienes permiso para eliminar este proyecto" }, 401)
            }

            await db.delete(projects).where(eq(projects.id, projectId))

            return c.json({ data: { id: existProject[0].id } });
        }
    )


export default app;