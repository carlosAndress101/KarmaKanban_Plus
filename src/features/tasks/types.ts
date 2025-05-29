
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


export type TaskDTO = {
  id: string;
  name: string;
  description?: string;
  status: "BACKLOG" | "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  dueDate?: Date;
  assignee?: string;
  project: string;
  workspaceId: string;
  position: number;
  createdAt?: Date;
  updatedAt?: Date;
};