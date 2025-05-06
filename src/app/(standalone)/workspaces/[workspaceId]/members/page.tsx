import { redirect } from "next/navigation";

import { getCurrent } from "@/feature/auth/actions";
import { MembersList } from "@/feature/workspaces/components/members-list";

const WorkspaceMembersPage = async () => {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  return (
    <div className="w-full lg:max-w-xl">
      <MembersList />
    </div>
  );
}

export default WorkspaceMembersPage;