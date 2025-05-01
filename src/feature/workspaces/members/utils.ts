import { db } from "@/lib/drizzle"
import { members } from "@/lib/schemas_drizzle"
import { eq } from "drizzle-orm"

export const getMember = async (workspaceId: string, userId: string) => {

    const members_ = await db
        .select()
        .from(members)
        .where(eq(members.id, userId) && eq(members.workspaceId, workspaceId))
    
    return members_[0]
}
