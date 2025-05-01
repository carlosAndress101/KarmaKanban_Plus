"use client";

import { useRouter } from "next/navigation";
import { useGetWorkspaces } from "@/feature/workspaces/api/useGetWorkspaces";
import { FaPlusCircle } from "react-icons/fa";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import WorkspaceAvatar from "@/feature/workspaces/components/workspace-avatar";
import { useWorkspaceId } from "@/feature/workspaces/hooks/useWorkspaceId"
import { useCreateWorkspaceModal } from "@/feature/workspaces/hooks/useCreateWorkspaceModal";

export const WorkspaceSwitcher = () => {

    const routes = useRouter();
    const workspaceId = useWorkspaceId();
    const { data: workspaces } = useGetWorkspaces();
	const { open } = useCreateWorkspaceModal()
    
    const onSelect = (id: string) => {
        routes.push(`/workspaces/${id}`);
    }
    return (
        <div className="flex flex-col gap-y-2">
			<div className="flex items-center justify-between">
				<p className="text-xs uppercase text-neutral-500">Workspace</p>
				<FaPlusCircle onClick={open} className="size-5 text-neutral-500 cursor-pointer hover:opacity-75" />
			</div>
			<Select onValueChange={onSelect} value={workspaceId}>
				<SelectTrigger className="w-full bg-neutral-200 font-medium p-1">
					<SelectValue placeholder="Select a workspace" />
				</SelectTrigger>
				<SelectContent>
					{workspaces?.map((w) => (
						<SelectItem key={w.id} value={w.id}>
							<div className="flex justify-start items-center gap-3 font-medium">
								<WorkspaceAvatar name={w.name} />
								<span className="truncate">{w.name}</span>
							</div>
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
    )
}