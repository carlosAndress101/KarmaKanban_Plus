import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { createWorkspaceSchema } from "../schema";
import { sessionMiddleware } from "@/lib/session";
import { workspaces } from "@/lib/schemas_drizzle";
import { db } from "@/lib/drizzle";

const app = new Hono()
    .post("/", zValidator("json", createWorkspaceSchema), sessionMiddleware, async (c) => {

        const user = c.get("user")
        const { name } = c.req.valid("json");

        if (!user?.id) {
            throw new Error("User ID is required");
        }

        const workspace = await db.insert(workspaces).values({
            name,
            userId: user.id
        })

        return c.json({ data: workspace });
    })

export default app;