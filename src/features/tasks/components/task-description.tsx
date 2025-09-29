import { useState, useEffect } from "react";
import { PencilIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DottedSeparator } from "@/components/dotted-separator";

import { TaskFront } from "../types";
import { useUpdateTask } from "../api/useUpdateTask";

interface TaskDescriptionProps {
  task: TaskFront;
  className?: string;
}

export const TaskDescription = ({ task, className }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(task.description);
  const { mutate, isPending } = useUpdateTask();

  // Sincroniza el estado local con la prop task.description
  useEffect(() => {
    setValue(task.description);
  }, [task.description]);

  const handleSave = () => {
    mutate(
      { json: { description: value }, param: { taskId: task.id } },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className={`p-4 border rounded-lg ${className || ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-lg font-semibold">Description</p>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setIsEditing((prev) => !prev)}
          className="cursor-pointer"
        >
          {isEditing ? (
            <>
              <XIcon className="size-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <PencilIcon className="size-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>
      <DottedSeparator className="my-4" />
      {isEditing ? (
        <div className="flex flex-col gap-y-4">
          <Textarea
            placeholder="Enter a description"
            value={value}
            rows={4}
            onChange={(e) => setValue(e.target.value)}
            disabled={isPending}
          />
          <Button
            size="sm"
            className="w-fit ml-auto cursor-pointer"
            onClick={handleSave}
            disabled={isPending}
          >
            {isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      ) : (
        <div className="whitespace-pre-wrap break-words overflow-y-auto max-h-[150px] pr-2">
          {task.description || (
            <span className="text-muted-foreground">No description</span>
          )}
        </div>
      )}
    </div>
  );
};
