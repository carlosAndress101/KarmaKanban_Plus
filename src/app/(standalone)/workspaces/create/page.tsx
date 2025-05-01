import { redirect } from "next/navigation";

import { getCurrent } from "@/feature/auth/actions";
import CreateWorkspaceForm from "@/feature/workspaces/components/createWorkspacesForm";

const WorkspaceCreatePage = async () => {
  const user = await getCurrent()
  if (!user) redirect("/sign-in")

  return (
    <div className="w-full lg:max-w-xl">
      <CreateWorkspaceForm />
    </div>
  );
};

export default WorkspaceCreatePage;