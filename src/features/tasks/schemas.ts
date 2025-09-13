// ...existing code...

import { z } from "zod";
import { TaskStatus } from "./types";

export const taskSchema = z.object({
  name: z.string().min(1, "Name required").trim(),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().uuid().trim(),
  project: z.string().min(1, "Project Required"),
  dueDate: z.coerce.date().optional(),
  assignee: z.string().min(1, "Assignee Required"),
  description: z.string().optional(),
  difficulty: z.enum(["Easy", "Medium", "Hard"], {
    required_error: "Difficulty required",
  }), // <-- Nuevo campo
  developerFeedback: z.string().nullable().optional(), // Allow feedback in updates
});

export const querySchema = z.object({
  workspaceId: z.string(),
  projectId: z
    .string()
    .optional()
    .transform((v) => v ?? undefined),
  assigneeId: z
    .string()
    .optional()
    .transform((v) => v ?? undefined),
  status: z
    .nativeEnum(TaskStatus)
    .optional()
    .transform((v) => v ?? undefined),
  search: z
    .string()
    .optional()
    .transform((v) => v ?? undefined),
  dueDate: z
    .string()
    .optional()
    .transform((v) => v ?? undefined),
  archived: z
    .boolean()
    .optional()
    .transform((v) => v ?? false), // Archive filter
});

export const BulkUpdateTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      status: z.nativeEnum(TaskStatus),
      position: z.number(),
      assigneeId: z.string().optional(),
    })
  ),
});

export type BulkUpdateTasksInput = z.infer<typeof BulkUpdateTasksSchema>;

export const taskDeveloperFeedbackSchema = z.object({
  developerFeedback: z.string().optional(),
});
