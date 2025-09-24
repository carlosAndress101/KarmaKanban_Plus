import { Hono } from "hono";
import { db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator";
import { sessionMiddleware } from "@/lib/session";
import { members, userRoles, users } from "@/lib/schemas_drizzle";
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    sessionMiddleware,
    zValidator("query", z.object({ workspaceId: z.string() })),
    async (c) => {
      const { workspaceId } = c.req.valid("query");
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const member = await db.query.members.findFirst({
        where: (fields) =>
          eq(fields.workspaceId, workspaceId) && eq(fields.userId, user.id),
      });

      if (!member) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const allMembers = await db
        .select({
          id: members.id,
          userId: members.userId,
          workspaceId: members.workspaceId,
          role: members.role,
          name: users.name,
          email: users.email,
          // Gamification fields
          points: members.points,
          gamificationRole: members.gamificationRole,
          selectedIcons: members.selectedIcons,
          aboutMe: members.aboutMe,
        })
        .from(members)
        .innerJoin(users, eq(members.userId, users.id))
        .where(eq(members.workspaceId, workspaceId));

      return c.json({ data: allMembers });
    }
  )
  .delete("/:memberId", sessionMiddleware, async (c) => {
    const { memberId } = c.req.param();
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    // Find the member to delete
    const memberToDelete = await db.query.members.findFirst({
      where: (fields) => eq(fields.id, memberId),
    });

    if (!memberToDelete) {
      return c.json({ error: "Member not found" }, 404);
    }

    // Verify it's not the last member of the workspace
    const allMembers = await db
      .select()
      .from(members)
      .where(eq(members.workspaceId, memberToDelete.workspaceId));

    if (allMembers.length === 1) {
      return c.json(
        { error: "Cannot delete the last member of the workspace" },
        400
      );
    }

    // Find the member making the request
    const requestingMember = await db.query.members.findFirst({
      where: (fields) =>
        eq(fields.workspaceId, memberToDelete.workspaceId) &&
        eq(fields.userId, user.id),
    });

    if (!requestingMember) {
      return c.json({ error: "You are not a member of this workspace" }, 403);
    }

    const isSelf = requestingMember.userId === memberToDelete.userId;
    const isRequestingAdmin = requestingMember.role === userRoles[1]; // "admin"
    const isTargetAdmin = memberToDelete.role === userRoles[1]; // "admin"

    // Deletion rules:
    // 1. You can only delete yourself
    // 2. Only admins can delete other members (but NOT other admins)
    // 3. Admins CANNOT delete other admins

    if (!isSelf) {
      // If not themselves, must be admin to delete others
      if (!isRequestingAdmin) {
        return c.json(
          { error: "Only administrators can remove other members" },
          403
        );
      }

      // Admins cannot delete other admins
      if (isTargetAdmin) {
        return c.json(
          { error: "Administrators cannot remove other administrators" },
          403
        );
      }
    }

    // If deleting themselves and is admin, verify there's another admin
    if (isSelf && isRequestingAdmin) {
      const otherAdmins = allMembers.filter(
        (m) => m.role === userRoles[1] && m.id !== memberToDelete.id
      );

      if (otherAdmins.length === 0) {
        return c.json(
          {
            error:
              "You cannot leave the workspace. You are the only administrator. Please assign another administrator first.",
          },
          400
        );
      }
    }

    // Proceed with deletion
    await db.delete(members).where(eq(members.id, memberId));

    return c.json({
      data: {
        id: memberToDelete.id,
        message: isSelf
          ? "You have left the workspace"
          : "Member removed successfully",
      },
    });
  })
  .patch(
    "/:memberId",
    sessionMiddleware,
    zValidator("json", z.object({ role: z.enum(userRoles) })),
    async (c) => {
      const { memberId } = c.req.param();
      const user = c.get("user");
      const { role } = c.req.valid("json");

      if (!user) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // 1. Find the member to update
      const memberToUpdate = await db.query.members.findFirst({
        where: (fields) => eq(fields.id, memberId),
      });

      if (!memberToUpdate) {
        return c.json({ error: "Member not found" }, 404);
      }

      // 2. Ver todos los miembros del workspace
      const allMembers = await db
        .select()
        .from(members)
        .where(eq(members.workspaceId, memberToUpdate.workspaceId));

      if (allMembers.length === 1) {
        return c.json({ error: "Cannot downgrade the only member" }, 400);
      }

      // 3. Verify that the user performing the action is ADMIN
      const requestingMember = await db.query.members.findFirst({
        where: (fields) =>
          eq(fields.workspaceId, memberToUpdate.workspaceId) &&
          eq(fields.userId, user.id),
      });

      if (!requestingMember) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      if (requestingMember.role !== userRoles[1]) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      // 4. Update the role
      await db.update(members).set({ role }).where(eq(members.id, memberId));

      return c.json({ data: { id: memberToUpdate.id } });
    }
  );

export default app;
