"use client";

import Link from "next/link";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useInviteCode } from "../hooks/useInviteCode";
import { useJoinWorkspace } from "../api/useJoinWorkspace";
import { useWorkspaceId } from "../hooks/useWorkspaceId";
import { useRouter } from "next/navigation";

interface JoinWorkspaceFormProps {
  initalValues: {
    name: string;
  };
}

export const JoinWorkspaceForm = ({ initalValues }: JoinWorkspaceFormProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const inviteCode = useInviteCode();
  const { mutate, isPending } = useJoinWorkspace();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = () => {
    // Limpiar errores anteriores
    setError(null);

    mutate(
      {
        param: { workspaceId },
        json: { inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data[0].id}`);
        },
        onError: (error) => {
          setError(error.message || "Failed to join workspace");
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="p-7">
        <CardTitle className="text-xl font-bold">
          Workspace invitation
        </CardTitle>
        <CardDescription>
          You have been invited to join the workspace{" "}
          <strong>{initalValues.name}</strong>
        </CardDescription>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-2 items-center justify-between">
          <Button
            className="w-full lg:w-fit"
            variant="secondary"
            type="button"
            size="lg"
            disabled={isPending}
          >
            <Link href="/">Cancel</Link>
          </Button>
          <Button
            className="w-full lg:w-fit"
            size="lg"
            type="button"
            disabled={isPending}
            onClick={onSubmit}
          >
            {isPending ? "Joining..." : "Join the workspace"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
