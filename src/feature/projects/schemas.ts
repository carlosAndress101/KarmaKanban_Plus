import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Requried"),
  workspaceId: z.string(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(1, "Minimum 1 character required").optional(),
});

export const updateProjectSchemaForm = z.object({
  name: z.string().min(1),
});

export type Project = {
  id: string;
  createdAt: string;
  updatedAt: string;

  name: string;
  workspaceId: string;
};