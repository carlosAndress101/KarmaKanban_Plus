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

            const { workspaceId } = c.req.valid("query")
            const user = c.get("user")

            if (!user) {
                return c.json({ error: "Unauthorized" }, 401);
            }

            const member = await db.query.members.findFirst({
                where: (fields) =>
                    eq(fields.workspaceId, workspaceId) &&
                    eq(fields.userId, user.id)
            })

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
        })
    .delete("/:memberId", sessionMiddleware, async (c) => {
        const { memberId } = c.req.param();
        const user = c.get("user");

        if (!user) {
            return c.json({ error: "Authentication required" }, 401);
        }

        // Buscar el miembro a eliminar
        const memberToDelete = await db.query.members.findFirst({
            where: (fields) => eq(fields.id, memberId),
        });

        if (!memberToDelete) {
            return c.json({ error: "Member not found" }, 404);
        }

        // Verificar que no sea el último miembro del workspace
        const allMembers = await db
            .select()
            .from(members)
            .where(eq(members.workspaceId, memberToDelete.workspaceId));

        if (allMembers.length === 1) {
            return c.json({ error: "Cannot delete the last member of the workspace" }, 400);
        }

        // Buscar el miembro que hace la petición
        const requestingMember = await db.query.members.findFirst({
            where: (fields) =>
                eq(fields.workspaceId, memberToDelete.workspaceId) &&
                eq(fields.userId, user.id),
        });

        if (!requestingMember) {
            return c.json({ error: "Tu no eres miembro de este workspace" }, 403);
        }

        const isSelf = requestingMember.id === memberToDelete.id;
        const isRequestingAdmin = requestingMember.role === userRoles[1]; // "admin"
        const isTargetAdmin = memberToDelete.role === userRoles[1]; // "admin"

        // Reglas de eliminación:
        // 1. Solo puedes eliminarte a ti mismo
        // 2. Solo los admins pueden eliminar a otros miembros (pero NO a otros admins)
        // 3. Los admins NO pueden eliminar a otros admins

        if (!isSelf) {
            // Si no es él mismo, debe ser admin para eliminar a otros
            if (!isRequestingAdmin) {
                return c.json({ error: "Solo administradores pueden eliminar otros miembros" }, 403);
            }

            // Los admins no pueden eliminar a otros admins
            if (isTargetAdmin) {
                return c.json({ error: "Administradores no pueden eliminar otros administradores" }, 403);
            }
        }

        // Si es él mismo eliminándose y es admin, verificar que haya otro admin
        if (isSelf && isRequestingAdmin) {
            const otherAdmins = allMembers.filter(m =>
                m.role === userRoles[1] && m.id !== memberToDelete.id
            );

            if (otherAdmins.length === 0) {
                return c.json({
                    error: "No se puede abandonar el espacio de trabajo. Usted es el único administrador. Por favor, asigne primero otro administrador."
                }, 400);
            }
        }

        // Proceder con la eliminación
        await db.delete(members).where(eq(members.id, memberId));

        return c.json({
            data: {
                id: memberToDelete.id,
                message: isSelf ? "Ha abandonado el espacio de trabajo" : "Miembro eliminado correctamente"
            }
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

            // 1. Buscar el miembro a actualizar
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

            // 3. Verificar que el usuario que realiza la acción es ADMIN
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

            // 4. Actualizar el rol
            await db
                .update(members)
                .set({ role })
                .where(eq(members.id, memberId));

            return c.json({ data: { id: memberToUpdate.id } });
        }
    );

export default app;