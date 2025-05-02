import { Hono } from "hono";
import { db } from "@/lib/drizzle";
import { getMember } from "../members/utils";
import { desc, eq, inArray } from "drizzle-orm";
import { generateInviteCode } from "@/lib/utils";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session";
import { members, userRoles, workspaces } from "@/lib/schemas_drizzle";
import { createWorkspaceSchema, updateWorkspaceSchema } from "../schema";

const app = new Hono()
    .get("/", sessionMiddleware, async (c) => {
        const user = c.get("user")

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const members_ = await db
            .select()
            .from(members)
            .where(eq(members.id, user.id))
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
    .post("/", zValidator("json", createWorkspaceSchema), sessionMiddleware, async (c) => {

        const user = c.get("user")
        const { name } = c.req.valid("json");

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const workspace = await db.insert(workspaces).values({
            name,
            userId: user.id,
            inviteCode: generateInviteCode(6)
        }).returning({ id: workspaces.id })

        await db.insert(members).values({
            id: user.id,
            workspaceId: workspace[0].id,
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
                return c.json({ error: "You don't have permission to update this workspace"}, 401)
            }

            const workspace = await db
                .update(workspaces)
                .set({name, updatedAt: new Date()}).where(eq(workspaces.id, workspaceId))
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

        const workspace = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId))
        
        return c.json({
            data: {
                id: workspace[0].id,
                name: workspace[0].name,
                inviteCode: workspace[0].inviteCode
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
            return c.json({ error: "Tu no tienes permiso para eliminar este workspace"}, 401)
        }

        await db.delete(workspaces).where(eq(workspaces.id, workspaceId))

        return c.json({data: {id: workspaceId}});
    })
    .post("/:workspaceId/reset-invite-code", sessionMiddleware, async (c) => {
        const user = c.get("user")
        const { workspaceId } = c.req.param();

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const member = await getMember(workspaceId, user?.id)

        if (!member || member.role !== userRoles[1]) {
            return c.json({ error: "Tu no tienes permiso para resetear el enlace de invitación"}, 401)
        }

        const workspace = await db
            .update(workspaces)
            .set({inviteCode: generateInviteCode(6)})
            .where(eq(workspaces.id, workspaceId))
            .returning()

        return c.json({data: workspace});
    })

export default app;