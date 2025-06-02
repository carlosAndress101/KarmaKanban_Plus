import { getCurrent } from "@/features/auth/actions"
import { redirect } from "next/navigation"
import { WorkspaceIdClient } from "./client"


const WorkspacesIdPage = async () => {

    const user = await getCurrent()
    if (!user) redirect("/sign-in")
    return <WorkspaceIdClient />;
}

export default WorkspacesIdPage