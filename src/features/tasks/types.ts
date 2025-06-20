import { z } from "zod";
import { taskSchema } from "./schemas";

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  dueDate: string;
  assignee: {
    id: string | null;
    name: string | null;
    lastName: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  };
  workspaceId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}


export type TaskFront = {
  id: string;
  name: string;
  description?: string; 
  status: TaskStatus;
  dueDate: string;
  assignee: string | assigneeTId;
  project: string | ProjectTId ;
  position: number;
  workspaceId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ProjectTId = {
  id: string;
  workspaceId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type assigneeTId = {
  name: string;
    email: string;
    id: string;
    workspaceId: string;
    userId: string;
    role: "member" | "admin";
    createdAt: string;
    updatedAt: string;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeAssignee(assignee: any): Task["assignee"] {
  if (!assignee) return null;

  if (typeof assignee === "string") {
    return { id: assignee, name: null, lastName: null };
  }

  return {
    id: assignee.id ?? null,
    name: assignee.name ?? null,
    lastName: "lastName" in assignee ? assignee.lastName ?? null : null,
  };
}

export function normalizeFormValues(initialValues: Task): z.infer<typeof taskSchema> {
  return {
    name: initialValues.name,
    status: initialValues.status,
    workspaceId: initialValues.workspaceId,
    project:
      typeof initialValues.project === "string"
        ? initialValues.project
        : initialValues.project?.id ?? "",
    assignee: initialValues.assignee?.id ?? "",
    dueDate: initialValues.dueDate ? new Date(initialValues.dueDate) : undefined,
    description: initialValues.description ?? "",
  };
}