
export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
}

export type Task = {
  id: string;
  name: string;
  description?: string; 
  status: TaskStatus;
  dueDate: string;
  assignee: string;
  project: string;
  position: number;
  workspaceId: string;
  createdAt?: string;
  updatedAt?: string;
};

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