"use client";

import { useGetProject } from "@/feature/projects/api/useGetProject";
import { useProjectId } from "@/feature/projects/hooks/useProjectId";
import { EditProjectForm } from "@/feature/projects/components/editProjectForm";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const ProjectIdSettingsClient = () => {
  const projectId = useProjectId();
  const { data: initialValues, isLoading } = useGetProject({ projectId });

  if (isLoading) return <PageLoader />;

  if (!initialValues) return <PageError message="Project not found" />;

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};