/* eslint-disable */
"use client";

import { useGetProject } from "@/features/projects/api/useGetProject";
import { useProjectId } from "@/features/projects/hooks/useProjectId";
import { EditProjectForm } from "@/features/projects/components/editProjectForm";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const ProjectIdSettingsClient = () => {
  const projectId = useProjectId();

  // Early return if no projectId
  if (!projectId) {
    return <PageError message="No project ID provided" />;
  }

  const { data: initialValues, isLoading } = useGetProject({ projectId });

  if (isLoading) return <PageLoader />;
  if (!initialValues) return <PageError message="Project not found" />;

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};