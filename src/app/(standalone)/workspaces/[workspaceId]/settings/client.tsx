"use client";

import { useWorkspaceId } from "@/feature/workspaces/hooks/useWorkspaceId";
import { useGetWorkspaceInfo } from "@/feature/workspaces/api/useGetWorkspace";
import EditWorkspaceForm from "@/feature/workspaces/components/editWorkspacesForm";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading } = useGetWorkspaceInfo({ workspaceId });

  if (isLoading) return <PageLoader />;

  if (!initialValues) return <PageError message="Workspace no encontrado" />;

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} />
    </div>
  );
};