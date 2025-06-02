import { Task } from "../tasks/types";

export type Project = {
  id: string;
  name: string;
  workspaceId: string;
};

export type TaskWithProject = Omit<Task, "project"> & {
  project: Project;
};