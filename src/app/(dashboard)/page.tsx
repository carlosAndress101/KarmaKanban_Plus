import { getCurrent } from "@/feature/auth/actions";

import { getWorkspaces } from "@/feature/workspaces/query";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrent()
  if (!user) redirect("/sign-in")

  const workspaces = await getWorkspaces();

  if (workspaces.total < 1) {
    redirect("/workspaces/create")
  }else {
    redirect(`/workspaces/${workspaces?.data[0].id}`)
  }
}
