"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { CreateTaskFormWrapper } from "./create-task-form-wrapper";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { DialogTitle } from "@/components/ui/dialog";

export const CreateTaskModal = () => {
  const { isOpen, setIsOpen, close } = useCreateTaskModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle className="sr-only"/>
      <CreateTaskFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};
