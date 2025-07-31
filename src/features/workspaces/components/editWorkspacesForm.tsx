"use client";
import { z } from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Workspace } from "../types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/useConfirm";
import { Button } from "@/components/ui/button";
import { updateWorkspaceSchema } from "../schema";
import { Separator } from "@/components/ui/separator";
import { ArrowLeftIcon, CopyIcon } from "lucide-react";
import { useUpdateWorkspace } from "../api/useUpdateWorkspace";
import { useDeleteWorkspace } from "../api/useDeleteWorkspace";
import { useResetInviteCode } from "../api/useResetInviteCode";

interface Props {
  onCancel?: () => void;
  initialValues: Workspace;
}

const EditWorkspaceForm = ({ onCancel, initialValues }: Props) => {
  const router = useRouter();
  const { mutate, isPending } = useUpdateWorkspace();
  const { mutate: deleteWorkspace, isPending: isDeletingWorkspace } =
    useDeleteWorkspace();
  const { mutate: resetInviteCode, isPending: isResetingInviteCode } =
    useResetInviteCode();

  const [DeleteDialog, confirmDelete] = useConfirm(
    "Eliminar workspace",
    "Esta acción es irreversible y eliminará todos los datos asociados",
    "destructive"
  );

  const [ResetDialog, confirmReset] = useConfirm(
    "Restablecer enlace de invitación",
    "Esto invalidará el enlace de invitación actual.",
    "destructive"
  );

  const handleDelete = async () => {
    const ok = await confirmDelete();

    if (!ok) return;

    deleteWorkspace(
      {
        param: { workspaceId: initialValues.id },
      },
      {
        onSuccess: () => {
          router.push("/");
        },
      }
    );
  };

  const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      ...initialValues,
    },
  });

  const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
    const finalValues = {
      ...values,
    };
    mutate(
      { json: finalValues, param: { workspaceId: initialValues.id } },
      {
        onSuccess: ({ data }) => {
          form.reset();
          router.push(`/workspaces/${data[0].id}`);
        },
      }
    );
  };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  const fullInviteLink = `${baseUrl}/workspaces/${initialValues.id}/join/${initialValues.inviteCode}`;

  const handleCopyInviteLink = () => {
    navigator.clipboard
      .writeText(fullInviteLink)
      .then(() =>
        toast.success("Enlace de invitación copiado en el portapapeles")
      );
  };

  const handleResetInviteCode = async () => {
    const ok = await confirmReset();

    if (!ok) return;

    resetInviteCode(
      { param: { workspaceId: initialValues.id } },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-y-4">
      <ResetDialog />
      <DeleteDialog />
      <Card className="w-full h-full border-none shadow-none">
        <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={
              onCancel
                ? onCancel
                : () => router.push(`/workspaces/${initialValues.id}`)
            }
          >
            <ArrowLeftIcon className="size-4 mr-2" />
            Atras
          </Button>
          <CardTitle className="text-xl font-bold">
            {initialValues.name}
          </CardTitle>
        </CardHeader>
        <div className="px-7">
          <Separator />
        </div>
        <CardContent className="p-7">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-y-4">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del Workspace</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ingrese el nombre del workspace"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between mt-7">
                <Button
                  type="button"
                  size="lg"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isPending}
                  className={cn(!onCancel && "invisible")}
                >
                  Cancel
                </Button>
                <Button type="submit" size="lg" disabled={isPending}>
                  Guardar cambios
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Invita a miembros</h3>
            <p className="text-sm text-muted-foreground">
              Usa el enlace de invitación para invitar a miembros a tu
              workspace.
            </p>

            <div className="mt-4">
              <div className="flex items-center gap-x-2">
                <Input disabled value={fullInviteLink} />
                <Button
                  onClick={handleCopyInviteLink}
                  variant="secondary"
                  className="size-12"
                >
                  <CopyIcon className="size-5" />
                </Button>
              </div>
            </div>

            <Separator />

            <Button
              size="sm"
              type="button"
              variant="destructive"
              className="mt-6 w-fit ml-auto"
              disabled={isPending || isResetingInviteCode}
              onClick={handleResetInviteCode}
            >
              Restablecer enlace
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full h-full border-none shadow-none">
        <CardContent className="p-7">
          <div className="flex flex-col">
            <h3 className="font-bold">Danger Zone</h3>
            <p className="text-sm text-muted-foreground">
              La eliminación de un workspace es irreversible y eliminará todos
              los datos asociados
            </p>
            <Separator />
            <Button
              size="sm"
              type="button"
              variant="destructive"
              className="mt-6 w-fit ml-auto"
              disabled={isPending || isDeletingWorkspace}
              onClick={handleDelete}
            >
              Eliminar Workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditWorkspaceForm;
