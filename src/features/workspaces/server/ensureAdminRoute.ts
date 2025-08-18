import { Hono } from "hono";
import { db } from "@/lib/drizzle";
import { eq, and } from "drizzle-orm";
import { sessionMiddleware } from "@/lib/session";
import { members, userRoles } from "@/lib/schemas_drizzle";

const app = new Hono();

// PATCH /api/workspaces/:workspaceId/ensure-admin
app.patch("/:workspaceId/ensure-admin", sessionMiddleware, async (c) => {
  const user = c.get("user");
  const { workspaceId } = c.req.param();

  if (!user || !user.id) {
    return c.json({ error: "User is required" }, 401);
  }

  // Update the member's role to admin
  const updated = await db
    .update(members)
    .set({ role: userRoles[1] }) // "admin"
    .where(
      and(eq(members.workspaceId, workspaceId), eq(members.userId, user.id))
    )
    .returning();

  if (!updated || updated.length === 0) {
    return c.json({ error: "Member not found in this workspace" }, 404);
  }

  return c.json({ data: updated[0], message: "Role set to admin" });
});

export default app;
