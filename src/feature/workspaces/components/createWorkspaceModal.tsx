"use client";

import CreateWorkspaceForm from "./createWorkspacesForm"
import { ResponsiveModal } from "@/components/responsive-modal";

const CreateWorkspaceModal = () => {
    return (
        <ResponsiveModal open onOpenChange={() => {}}>
            <CreateWorkspaceForm />
        </ResponsiveModal>
    )
}

export default CreateWorkspaceModal