import { Hono } from "hono";
import { db } from "@/lib/drizzle";
import { eq, desc } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session";
import { projects, tasks, userRoles, members } from "@/lib/schemas_drizzle";
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
                projectManagerId: member.id, // Assign creator as Project Manager by default
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
    .get("/:projectId/analytics", sessionMiddleware, async (c) => {
        const { projectId } = c.req.param();
        const user = c.get("user");

        if (!user) return c.json({ error: "Authentication required" }, 401);

        const [project] = await db
            .select()
            .from(projects)
            .where(eq(projects.id, projectId));

        if (!project) return c.json({ error: "Project not found" }, 404);

        const [member] = await getMember(project.workspaceId, user.id);
        if (!member) return c.json({ error: "Unauthorized" }, 401);

        const now = new Date();
        const thisMonthStart = startOfMonth(now);
        const thisMonthEnd = endOfMonth(now);
        const lastMonthStart = startOfMonth(subMonths(now, 1));
        const lastMonthEnd = endOfMonth(subMonths(now, 1));

        // ✅ Todas las tareas actuales del proyecto
        const allTasks = await db
            .select()
            .from(tasks)
            .where(eq(tasks.projectId, projectId));

        const totalTaskCount = allTasks.length;
        const assignedTaskCount = allTasks.filter(
            (t) => t.assigneeId === member.id
        ).length;
        const completedTaskCount = allTasks.filter(
            (t) => t.status === "DONE"
        ).length;
        const inCompleteTaskCount = allTasks.filter(
            (t) => t.status !== "DONE"
        ).length;
        const overDueTaskCount = allTasks.filter(
            (t) =>
                t.status !== "DONE" &&
                t.dueDate &&
                new Date(t.dueDate) < now
        ).length;

        // ✅ Solo tareas creadas este mes/anterior
        const thisMonthTasks = allTasks.filter(
            (t) =>
                new Date(t.createdAt) >= thisMonthStart &&
                new Date(t.createdAt) <= thisMonthEnd
        );

        const lastMonthTasks = allTasks.filter(
            (t) =>
                new Date(t.createdAt) >= lastMonthStart &&
                new Date(t.createdAt) <= lastMonthEnd
        );

        const taskDifference = thisMonthTasks.length - lastMonthTasks.length;

        const assignedTaskDifference =
            thisMonthTasks.filter((t) => t.assigneeId === member.id).length -
            lastMonthTasks.filter((t) => t.assigneeId === member.id).length;

        const completedTaskDifference =
            thisMonthTasks.filter((t) => t.status === "DONE").length -
            lastMonthTasks.filter((t) => t.status === "DONE").length;

        const inCompleteTaskDifference =
            thisMonthTasks.filter((t) => t.status !== "DONE").length -
            lastMonthTasks.filter((t) => t.status !== "DONE").length;

        const overDueTaskDifference =
            thisMonthTasks.filter(
                (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < now
            ).length -
            lastMonthTasks.filter(
                (t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < now
            ).length;

        return c.json({
            data: {
                taskCount: totalTaskCount,
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
    })
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
    .patch(
        "/:projectId/manager",
        sessionMiddleware,
        zValidator("json", z.object({
            projectManagerId: z.string().nullable(),
        })),
        async (c) => {
            const user = c.get("user");
            const { projectManagerId } = c.req.valid("json");
            const { projectId } = c.req.param();

            if (!user) {
                return c.json({ error: "Authentication required" }, 401);
            }

            const [project] = await db
                .select()
                .from(projects)
                .where(eq(projects.id, projectId));

            if (!project) {
                return c.json({ error: "Project not found" }, 404);
            }

            const member = await getMember(project.workspaceId, user.id);
            
            if (!member || member.role !== userRoles[1]) {
                return c.json({ error: "Only admins can change Project Managers" }, 403);
            }

            // If assigning a new manager, validate they exist in the workspace
            if (projectManagerId) {
                const [newManager] = await db
                    .select()
                    .from(members)
                    .where(eq(members.id, projectManagerId));
                
                if (!newManager || newManager.workspaceId !== project.workspaceId) {
                    return c.json({ error: "Invalid Project Manager" }, 400);
                }
            }

            const [updatedProject] = await db
                .update(projects)
                .set({ 
                    projectManagerId,
                    updatedAt: new Date() 
                })
                .where(eq(projects.id, projectId))
                .returning();

            return c.json({ data: updatedProject });
        }
    )


export default app;
