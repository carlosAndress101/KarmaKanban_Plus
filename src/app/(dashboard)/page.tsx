import { getCurrent } from "@/feature/auth/actions";
import CreateWorkspaceForm from "@/feature/workspaces/components/createWorkspacesForm";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent()
  if (!user) redirect("sign-in")
    
  return (
      <div>
        <CreateWorkspaceForm/>
      </div>
  )
}
