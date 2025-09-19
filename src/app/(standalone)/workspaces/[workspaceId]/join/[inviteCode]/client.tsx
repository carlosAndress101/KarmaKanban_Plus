"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useGetWorkspaceInfo } from "@/features/workspaces/api/useGetWorkspace";
import { useGetMember } from "@/features/members/api/useGetMember";
import { useCurrent } from "@/features/auth/api/use-current";
import { JoinWorkspaceForm } from "@/features/workspaces/components/joinWorkspaceForm";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceIdJoinClient = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const { data: workspaceInfo, isLoading: isLoadingWorkspace } =
    useGetWorkspaceInfo({
      workspaceId,
    });
  const { data: members, isLoading: isLoadingMembers } = useGetMember({
    workspaceId,
  });

  // Verificar si el usuario ya es miembro del workspace
  useEffect(() => {
    if (currentUser && members && !isLoadingMembers) {
      const isMember = members.some(
        (member) => member.userId === currentUser.id
      );
      if (isMember) {
        // Si ya es miembro, redirigir al workspace
        router.push(`/workspaces/${workspaceId}`);
      }
    }
  }, [currentUser, members, isLoadingMembers, workspaceId, router]);

  if (isLoadingWorkspace || isLoadingMembers) {
    return <PageLoader />;
  }

  if (!workspaceInfo) {
    return <PageError message="Workspace not found" />;
  }

  // Si el usuario ya es miembro, mostrar loading mientras redirige
  if (currentUser && members) {
    const isMember = members.some((member) => member.userId === currentUser.id);
    if (isMember) {
      return <PageLoader />;
    }
  }

  return <JoinWorkspaceForm initalValues={workspaceInfo} />;
};
