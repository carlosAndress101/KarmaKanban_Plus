import { Hono } from "hono";
import { db } from "@/lib/drizzle";
import { getMember } from "../members/utils";
import { desc, eq, inArray } from "drizzle-orm";
import { generateInviteCode } from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session";
import { members, userRoles, workspaces } from "@/lib/schemas_drizzle";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";
import { z } from "zod";

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user")

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const members_ = await db
            .select()
            .from(members)
            .where(eq(members.userId, user.id))
            .orderBy(desc(members.createdAt))

        if (members_.length === 0) {
            return c.json({ data: [] });
        }

        const workspaceIds = members_.map(m => m.workspaceId);

        const workspaces_ = await db
            .select()
            .from(workspaces)
            .where(inArray(workspaces.id, workspaceIds))
            .orderBy(desc(workspaces.createdAt));


        return c.json({ data: workspaces_ });
    })
    .post("/", zValidator("form", createWorkspaceSchema), sessionMiddleware, async (c) => {

        const user = c.get("user")
        const { name } = c.req.valid("form");

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const [workspace] = await db.insert(workspaces).values({
            name,
            userId: user.id,
            inviteCode: generateInviteCode(6)
        }).returning({ id: workspaces.id })

        await db.insert(members).values({
            userId: user.id,
            workspaceId: workspace.id,
            role: userRoles[1]
        })

        return c.json({ data: workspace });
    })
    .patch(
        "/:workspaceId",
        sessionMiddleware,
        zValidator("json", updateWorkspaceSchema),
        async (c) => {
            const user = c.get("user")
            const { name } = c.req.valid("json");
            const { workspaceId } = c.req.param();

            if (!user?.id) {
                throw new Error("User ID is required");
            }

            if (!workspaceId) {
                throw new Error("Workspace ID is required");
            }

            const member = await getMember(workspaceId, user.id)

            if (!member || member.role !== userRoles[1]) {
                return c.json({ error: "You don't have permission to update this workspace" }, 401)
            }

            const workspace = await db
                .update(workspaces)
                .set({ name, updatedAt: new Date() }).where(eq(workspaces.id, workspaceId))
                .returning({ id: workspaces.id })

            return c.json({ data: workspace })
        })
    .get("/:workspaceId", sessionMiddleware, async (c) => {

        const user = c.get("user");
        const { workspaceId } = c.req.param();

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const member = await getMember(workspaceId, user?.id)

        if (!member) return c.json({ error: "Unauthorized" }, 401);

        const [workspace] = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId))

        return c.json({
            data: {
                id: workspace.id,
                name: workspace.name,
                inviteCode: workspace.inviteCode,
                userId: workspace.userId
            },
        })


    })
    .delete("/:workspaceId", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const { workspaceId } = c.req.param();

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const member = await getMember(workspaceId, user?.id)

        if (!member || member.role !== userRoles[1]) {
            return c.json({ error: "Tu no tienes permiso para eliminar este workspace" }, 401)
        }

        await db.delete(workspaces).where(eq(workspaces.id, workspaceId))

        return c.json({ data: { id: workspaceId } });
    })
    .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const { workspaceId } = c.req.param();

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const member = await getMember(workspaceId, user?.id)

        if (!member || member.role !== userRoles[1]) {
            return c.json({ error: "Tu no tienes permiso para resetear el enlace de invitación" }, 401)
        }

        const workspace = await db
            .update(workspaces)
            .set({ inviteCode: generateInviteCode(6) })
            .where(eq(workspaces.id, workspaceId))
            .returning()

        return c.json({ data: workspace });
    })
    .post("/:workspaceId/join", sessionMiddleware, zValidator("json", z.object({ inviteCode: z.string() })), async (c) => {

        const user = c.get("user")
        if (!user?.id) {
            throw new Error("User ID is required");
        }
        const { workspaceId } = c.req.param();
        const { inviteCode } = c.req.valid("json")

        const member = await getMember(workspaceId, user?.id);

        if (member) {
            return c.json({ error: "Ya has unido a este workspace" }, 400)
        }

        const workspace = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId))

        if (workspace[0].inviteCode !== inviteCode) {
            return c.json({ error: "Codigo de invitación no válido" }, 400)
        }

        await db.insert(members).values({
            workspaceId,
            userId: user.id,
            role: userRoles[1]
        })

        return c.json({ data: workspace });
    })


export default app;