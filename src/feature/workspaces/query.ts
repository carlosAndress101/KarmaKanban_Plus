import { db } from "@/lib/drizzle";
import { members, workspaces } from "@/lib/schemas_drizzle";
import { eq, inArray, desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { AUTH_COOKIE, SECRET_JWT } from "../auth/constants";
import { verify } from "hono/jwt";

export const getWorkspaces = async () => {
    const seccion = (await cookies()).get(AUTH_COOKIE);

    if (!seccion) return { data: [], total: 0 };

    let payload;
    try {
        payload = await verify(seccion.value, SECRET_JWT);
    } catch {
        return { data: [], total: 0 };
    }

    if (!payload.sub || !payload?.email || typeof payload.sub !== 'string') {
        return { data: [], total: 0 };
    }

    try {
        const members_ = await db
            .select()
            .from(members)
            .where(eq(members.id, payload.sub));

        if (members_.length === 0) {
            return { data: [], total: 0 };
        }

        const workspaceIds = members_.map(m => m.workspaceId);

        const workspaces_ = await db
            .select()
            .from(workspaces)
            .where(inArray(workspaces.id, workspaceIds))
            .orderBy(desc(workspaces.createdAt));

        return { data: workspaces_, total: workspaces_.length };

    } catch {
        return { data: [], total: 0 };
    }
};

interface Props {
    workspaceId: string;
}

export const getWorkspaceinfo = async ({ workspaceId }: Props) => {
    try {

        const workspace = await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, workspaceId))

        return {
            name: workspace[0].name,
        };
    } catch {
        return null;
    }
};