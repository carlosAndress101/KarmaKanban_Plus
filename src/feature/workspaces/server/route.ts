import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session";
import { members, userRoles, workspaces } from "@/lib/schemas_drizzle";
import { db } from "@/lib/drizzle";
import { desc, eq, inArray } from "drizzle-orm";
import { generateInviteCode } from "@/lib/utils";

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

export default app;