"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMember } from "@/features/members/api/useGetMember";
import { MemberAvatar } from "@/features/members/components/meberAvatar";
import { useUpdateMember } from "@/features/members/api/useUpdateMember";
import { useDeleteMember } from "@/features/members/api/useDeleteMember";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useWorkspaceId } from "../hooks/useWorkspaceId";
import { useConfirm } from "@/hooks/useConfirm";
import { UserRole, userRoles } from "@/lib/schemas_drizzle";

export const MemberList = () => {
  const workspaceId = useWorkspaceId();
  const [ConfirmDialog, confirm] = useConfirm(
    "Remove member",
    "This member will be removed from the workspace"
  );

  const { data: currentUser } = useCurrent();
  const { data: membersData } = useGetMember({ workspaceId });

  // More robust deduplication and unique key generation
  const members = membersData?.reduce((unique, member, index) => {
    const exists = unique.find((m) => m.id === member.id);
    if (!exists) {
      unique.push({
        ...member,
        uniqueIndex: index, // Add index for unique key generation
      });
    }
    return unique;
  }, [] as Array<(typeof membersData)[0] & { uniqueIndex: number }>);

  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const handleUpdateMember = (memberId: string, role: UserRole) => {
    updateMember(
      { json: { role }, param: { memberId } },
      { onSuccess: () => {} }
    );
  };

  const handleDeleteMember = async (memberId: string) => {
    const ok = await confirm();

    if (!ok) return;

    deleteMember(
      { param: { memberId } },
      {
        onSuccess: () => {
          window.location.reload();
        },
      }
    );
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <ConfirmDialog />
      <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
        <Button asChild variant="secondary" size="sm">
          <Link
            href={`/workspaces/${workspaceId}`}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Members list</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        {members?.map((member, index) => {
          // Check if this member is the current logged-in user
          const isSelf = currentUser?.id === member.userId;
          const isTargetAdmin = member.role === userRoles[1]; // admin

          // Find current user's membership in this workspace to check their role
          const currentUserMembership = members?.find(
            (m) => m.userId === currentUser?.id
          );
          const isCurrentUserAdmin =
            currentUserMembership?.role === userRoles[1];

          // Permission logic
          const canUpdateRole = isCurrentUserAdmin && !isSelf;
          const canDelete = (isCurrentUserAdmin && !isTargetAdmin) || isSelf;

          // Create a truly unique key combining multiple identifiers
          const uniqueKey = `member-${member.id}-${member.uniqueIndex}-${workspaceId}`;

          return (
            <Fragment key={uniqueKey}>
              <div className="flex items-center gap-2">
                <MemberAvatar
                  className="size-10"
                  fallbackClassName="text-lg"
                  name={member.name}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {member.name}
                    {isSelf && " (You)"}
                    {isTargetAdmin && " (Administrator)"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {member.email}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="ml-auto" variant="secondary" size="icon">
                      <MoreVerticalIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent side="bottom" align="end">
                    {/* Solo mostrar opciones de rol si se puede actualizar */}
                    {canUpdateRole && (
                      <>
                        <DropdownMenuItem
                          className="font-medium"
                          onClick={() =>
                            handleUpdateMember(member.id, userRoles[1])
                          }
                          disabled={isUpdatingMember || isTargetAdmin}
                        >
                          Set as administrator
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="font-medium"
                          onClick={() =>
                            handleUpdateMember(member.id, userRoles[0])
                          }
                          disabled={isUpdatingMember || !isTargetAdmin}
                        >
                          Set as member
                        </DropdownMenuItem>
                      </>
                    )}

                    {/* Opción de eliminar con lógica mejorada */}
                    <DropdownMenuItem
                      className="font-medium text-amber-700"
                      onClick={() => handleDeleteMember(member.id)}
                      disabled={isDeletingMember || !canDelete}
                    >
                      {isSelf ? "Leave the workspace" : `Delete ${member.name}`}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {index < (members?.length ?? 0) - 1 && (
                <Separator className="my-2.5" />
              )}
            </Fragment>
          );
        })}
      </CardContent>
    </Card>
  );
};
