"use client";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Workspace } from "../types";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { updateWorkspaceSchema } from "../schema";
import { useUpdateWorkspace } from "../api/useUpdateWorkspace";
import { useConfirm } from "@/hooks/useConfirm";
import { ArrowLeftIcon } from "lucide-react";

interface Props {
    onCancel?: () => void;
    initialValues: Workspace;
}

const EditWorkspaceForm = ({ onCancel, initialValues }: Props) => {
    const router = useRouter();
    const { mutate, isPending } = useUpdateWorkspace();

    const form = useForm<z.infer<typeof updateWorkspaceSchema>>({
        resolver: zodResolver(updateWorkspaceSchema),
        defaultValues: {
            ...initialValues,
        },
    });

    const [ResetDialog] = useConfirm(
        "Reset invite link",
        "This will invalidate the current invite link.",
        "destructive"
    );

    const onSubmit = (values: z.infer<typeof updateWorkspaceSchema>) => {
        const finalValues = {
            ...values,
        };
        mutate({ json: finalValues, param: { workspaceId: initialValues.id } }, {
            onSuccess: ({ data }) => {
                form.reset();
                router.push(`/workspaces/${data[0].id}`);
            },

        });
    }

    return (
        <div className="flex flex-col gap-y-4">
            <ResetDialog />
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
                        Back
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
                                            <FormLabel>Workspace Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ingrese el nombre del workspace" {...field} />
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
                                    Guerdar cambios
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Invite Members</h3>
                        <p className="text-sm text-muted-foreground">
                            Use the invite link to add members to your workspace.
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

                        <DottedSeparator className="py-7" />

                        <Button
                            size="sm"
                            type="button"
                            variant="destructive"
                            className="mt-6 w-fit ml-auto"
                            disabled={isPending || isResetingInviteCode}
                            onClick={handleResetInviteCode}
                        >
                            Reset invite link
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="w-full h-full border-none shadow-none">
                <CardContent className="p-7">
                    <div className="flex flex-col">
                        <h3 className="font-bold">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Deleting a workspace is a irreversible and will remove all
                            associated data
                        </p>
                        <DottedSeparator className="py-7" />
                        <Button
                            size="sm"
                            type="button"
                            variant="destructive"
                            className="mt-6 w-fit ml-auto"
                            disabled={isPending || isDeletingWorkspace}
                            onClick={handleDelete}
                        >
                            Delete Workspace
                        </Button>
                    </div>
                </CardContent>
            </Card> */}
        </div>
    );

}

export default EditWorkspaceForm;