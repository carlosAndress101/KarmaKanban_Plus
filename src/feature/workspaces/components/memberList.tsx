"use client";

import Link from "next/link";
import { Fragment } from "react";
import { ArrowLeftIcon, MoreVerticalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useGetMember } from "@/feature/members/api/useGetMember";
import { MemberAvatar } from "@/feature/members/components/meberAvatar";
import { useUpdateMember } from "@/feature/members/api/useUpdateMember";
import { useDeleteMember } from "@/feature/members/api/useDeleteMember";
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
    "Eliminar miembro",
    "Este miembro será eliminado del espacio de trabajo"
  );

  const { data } = useGetMember({ workspaceId });
  const { mutate: deleteMember, isPending: isDeletingMember } =
    useDeleteMember();
  const { mutate: updateMember, isPending: isUpdatingMember } =
    useUpdateMember();

  const handleUpdateMember = (memberId: string, role: UserRole) => {
    updateMember(
      { json: { role }, param: { memberId } },
      { onSuccess: () => { } }
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
          <Link href={`/workspaces/${workspaceId}`} className="flex items-center gap-2">
            <ArrowLeftIcon className="size-4" />
            Atras
          </Link>
        </Button>
        <CardTitle className="text-xl font-bold">Lista de miembros</CardTitle>
      </CardHeader>
      <div className="px-7">
        <Separator />
      </div>
      <CardContent className="p-7">
        {data?.map((member, index) => {
          // Encontrar el usuario actual correctamente
          const currentUser = data.find((m) => m.userId); // Asumiendo que tienes esta propiedad
          
          const isCurrentUserAdmin = currentUser?.role === userRoles[1]; // admin
          const isTargetAdmin = member.role === userRoles[1]; // admin
          const isSelf = currentUser?.memberId === member.memberId;
          
          // Lógica de permisos mejorada
          const canUpdateRole = isCurrentUserAdmin && !isSelf;
          const canDelete = (isCurrentUserAdmin && !isTargetAdmin) || isSelf;
          
          return (
            <Fragment key={member.memberId}>
              <div className="flex items-center gap-2">
                <MemberAvatar
                  className="size-10"
                  fallbackClassName="text-lg"
                  name={member.name}
                />
                <div className="flex flex-col">
                  <p className="text-sm font-medium">
                    {member.name}
                    {isSelf && " (Tu)"}
                    {isTargetAdmin && " (Administrador)"}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.email}</p>
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
                            handleUpdateMember(member.memberId, userRoles[1])
                          }
                          disabled={isUpdatingMember || isTargetAdmin}
                        >
                          Establecer como administrador
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="font-medium"
                          onClick={() =>
                            handleUpdateMember(member.memberId, userRoles[0])
                          }
                          disabled={isUpdatingMember || !isTargetAdmin}
                        >
                          Establecer como miembro
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {/* Opción de eliminar con lógica mejorada */}
                    <DropdownMenuItem
                      className="font-medium text-amber-700"
                      onClick={() => handleDeleteMember(member.memberId)}
                      disabled={isDeletingMember || !canDelete}
                    >
                      {isSelf ? "Abandonar el espacio de trabajo" : `Eliminar ${member.name}`}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {index < data.length - 1 && (
                <Separator className="my-2.5" />
              )}
            </Fragment>
          )
        })}
      </CardContent>
    </Card>
  )
}