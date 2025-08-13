"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Settings } from "lucide-react";
import Link from "next/link";

interface ProjectManagerNoticeProps {
  projectId: string;
  workspaceId: string;
  isAdmin: boolean; // Only admins can assign project managers
}

export const ProjectManagerNotice = ({ 
  projectId, 
  workspaceId, 
  isAdmin 
}: ProjectManagerNoticeProps) => {
  if (!isAdmin) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>No Project Manager Assigned</AlertTitle>
        <AlertDescription>
          This project doesn't have a Project Manager assigned. Some store features may be limited.
          Contact an administrator to assign a Project Manager.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-yellow-200 bg-yellow-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>No Project Manager Assigned</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          This project needs a Project Manager to manage store items and redemption requests.
        </span>
        <Button size="sm" asChild className="ml-4">
          <Link 
            href={`/workspaces/${workspaceId}/projects/${projectId}/settings`}
          >
            <Settings className="h-4 w-4 mr-2" />
            Project Settings
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  );
};
