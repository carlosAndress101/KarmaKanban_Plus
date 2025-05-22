import { redirect } from "next/navigation";

import { getCurrent } from "@/feature/auth/actions";

import { ProjectIdSettingsClient } from "./client";

const ProjectIdSettingsPage = async () => {
  const user = await getCurrent();

  if (!user) redirect("/sign-in");

  return <ProjectIdSettingsClient />;
};

export default ProjectIdSettingsPage;