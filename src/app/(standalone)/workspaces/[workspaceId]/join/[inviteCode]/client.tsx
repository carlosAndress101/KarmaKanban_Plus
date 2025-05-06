"use client";

import { useWorkspaceId } from "@/feature/workspaces/hooks/useWorkspaceId";
import { useGetWorkspaceInfo } from "@/feature/workspaces/api/useGetWorkspace";
import { JoinWorkspaceForm } from "@/feature/workspaces/components/joinWorkspaceForm";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceIdJoinClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initalValues, isLoading } = useGetWorkspaceInfo({
    workspaceId,
  });

  if (isLoading) return <PageLoader />;

  if (!initalValues) return <PageError message="Workspace not found" />;

  return <JoinWorkspaceForm initalValues={initalValues} />;
};