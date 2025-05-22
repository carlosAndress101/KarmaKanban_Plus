import { redirect } from "next/navigation";

import { getCurrent } from "@/feature/auth/actions";
import { MemberList } from "@/feature/workspaces/components/memberList";

const WorkspaceIdMembersPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <MemberList />
    </div>
  );
};

export default WorkspaceIdMembersPage;
