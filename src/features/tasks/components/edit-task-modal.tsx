"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { EditTaskFormWrapper } from "./edit-task-form-wrapper";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";

interface EditTaskModalProps {
  onEditSuccess?: () => void;
}

export const EditTaskModal = ({ onEditSuccess }: EditTaskModalProps) => {
  const { taskId, close } = useEditTaskModal();

  return (
    <ResponsiveModal open={!!taskId} onOpenChange={close}>
      {taskId && (
        <EditTaskFormWrapper
          id={taskId}
          onCancel={close}
          onEditSuccess={onEditSuccess}
        />
      )}
    </ResponsiveModal>
  );
};
