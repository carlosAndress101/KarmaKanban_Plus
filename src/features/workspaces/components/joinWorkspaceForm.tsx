"use client";

import Link from "next/link";
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

  const onSubmit = () => {
    mutate(
      {
        param: { workspaceId },
        json: { inviteCode },
      },
      {
        onSuccess: ({ data }) => {
          router.push(`/workspaces/${data[0].id}`);
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
            Join the workspace
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
