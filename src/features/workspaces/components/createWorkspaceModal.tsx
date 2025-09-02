"use client";

import { useCreateWorkspaceModal } from "../hooks/useCreateWorkspaceModal";
import CreateWorkspaceForm from "./createWorkspacesForm";
import { ResponsiveModal } from "@/components/responsive-modal";

const CreateWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();
  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateWorkspaceForm onCancel={close} />
    </ResponsiveModal>
  );
};

export default CreateWorkspaceModal;
