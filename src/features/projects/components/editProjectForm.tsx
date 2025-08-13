"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/hooks/useConfirm";
import { DottedSeparator } from "@/components/dotted-separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Project, updateProjectSchema } from "../schemas";
import { useUpdateProject } from "../api/useUpdateProject";
import { useDeleteProject } from "../api/useDeleteProject";
import { useUpdateProjectManager } from "../api/useUpdateProjectManager";
import { useGetMember } from "@/features/members/api/useGetMember";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { ArrowLeftIcon, AlertTriangleIcon, UserIcon } from "lucide-react";

interface EditProjectFormProps {
    onCancel?: () => void;
    initialValues: Project;
}

export const EditProjectForm = ({
    onCancel,
    initialValues,
}: EditProjectFormProps) => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const { mutate, isPending } = useUpdateProject();
    const { mutate: deleteProject, isPending: isDeletingProject } =
        useDeleteProject();
    const { mutate: updateProjectManager, isPending: isUpdatingManager } =
        useUpdateProjectManager();
    
    // Get workspace members for Project Manager selection
    const { data: members } = useGetMember({ workspaceId });

    const [DeleteDialog, confirmDelete] = useConfirm(
        "Eliminar Proyecto",
        "Esta acción es irreversible y eliminará todos los datos asociados",
        "destructive"
    );

    const handleDelete = async () => {
        const ok = await confirmDelete();

        if (!ok) return;

        deleteProject(
            { param: { projectId: initialValues.id } },
            {
                onSuccess: () => {
                    window.location.href = `/workspaces/${initialValues.workspaceId}`;
                },
            }
        );
    };

    const form = useForm<z.infer<typeof updateProjectSchema>>({
        resolver: zodResolver(updateProjectSchema),
        defaultValues: {
            ...initialValues
        },
    });

    const onSubmit = (values: z.infer<typeof updateProjectSchema>) => {
        const finalValues = {
            ...values
        };

        mutate({ form: finalValues, param: { projectId: initialValues.id } });
    };

    const handleProjectManagerChange = (managerId: string | null) => {
        updateProjectManager({
            param: { projectId: initialValues.id },
            json: { projectManagerId: managerId }
        });
    };

    // Find current project manager
    const currentManager = members?.find(member => member.id === initialValues.projectManagerId);
    const hasProjectManager = !!initialValues.projectManagerId;

    return (
        <div className="flex flex-col gap-y-4">
            <DeleteDialog />

            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="flex flex-row items-center gap-x-4 p-7 space-y-0">
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={
                            onCancel
                                ? onCancel
                                : () =>
                                    router.push(
                                        `/workspaces/${initialValues.workspaceId}/projects/${initialValues.id}`
                                    )
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
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <div className="flex flex-col gap-y-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre del Proyecto</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Enter project name" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <DottedSeparator className="py-7" />
                            <div className="flex items-center justify-between">
                                <Button
                                    type="button"
                                    size="lg"
                                    variant="secondary"
                                    onClick={onCancel}
                                    disabled={isPending}
                                    className={cn(!onCancel && "invisible")}
                                >
                                    Cancelar
                                </Button>

                                <Button type="submit" size="lg" disabled={isPending}>
                                    Guardar cambios
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Project Manager Assignment Card */}
            <Card className="w-full h-full border-none shadow-none">
                <CardHeader className="p-7">
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon className="size-5" />
                        Project Manager
                    </CardTitle>
                </CardHeader>
                <div className="px-7">
                    <DottedSeparator />
                </div>
                <CardContent className="p-7">
                    {!hasProjectManager && (
                        <Alert className="mb-4">
                            <AlertTriangleIcon className="h-4 w-4" />
                            <AlertDescription>
                                No Project Manager assigned. Tasks may only award points when a Project Manager is assigned to manage the store system.
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="flex flex-col gap-y-4">
                        <div>
                            <FormLabel>Assign Project Manager</FormLabel>
                            <p className="text-sm text-muted-foreground mb-2">
                                The Project Manager can manage store items and approve redemption requests.
                            </p>
                        </div>
                        
                        <Select
                            value={initialValues.projectManagerId || "none"}
                            onValueChange={(value) => handleProjectManagerChange(value === "none" ? null : value)}
                            disabled={isUpdatingManager}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a Project Manager" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No Project Manager</SelectItem>
                                {members?.map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.name} {member.lastName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        
                        {currentManager && (
                            <div className="text-sm text-muted-foreground">
                                Current manager: <span className="font-medium">{currentManager.name} {currentManager.lastName}</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            La eliminación de un proyecto es irreversible y eliminará todos los datos asociados
                        </p>
                        <DottedSeparator className="py-7" />
                        <Button
                            size="sm"
                            type="button"
                            variant="destructive"
                            className="mt-6 w-fit ml-auto"
                            disabled={isPending || isDeletingProject}
                            onClick={handleDelete}
                        >
                            Eliminar Proyecto
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};