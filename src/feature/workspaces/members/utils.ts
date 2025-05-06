import { db } from "@/lib/drizzle"
import { members } from "@/lib/schemas_drizzle"
import { and, eq } from "drizzle-orm"

export const getMember = async (workspaceId: string, userId: string) => {

    const members_ = await db
        .select()
        .from(members)
        .where(
            and(
                eq(members.workspaceId, workspaceId),
                eq(members.userId, userId)
            )
        )
    
    return members_[0]
}
