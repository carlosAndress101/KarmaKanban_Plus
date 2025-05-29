import { getCurrent } from "@/features/auth/actions"
import { redirect } from "next/navigation"


const WorkspacesIdPage = async () => {

    const user = await getCurrent()
    if (!user) redirect("/sign-in")
    return (
        <div>
            Workspaces ID
        </div>
    )
}

export default WorkspacesIdPage