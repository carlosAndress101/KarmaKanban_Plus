import { z } from "zod";
import { TaskStatus } from "./types";

export const taskSchema = z.object({
  name: z.string().min(1, "Nombre requerido").trim(),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().uuid().trim(),
  project: z.string().min(1, "Project requerido"),
  dueDate: z.coerce.date().optional(),
  assignee: z.string().min(1, "Assignee requerido"),
  description: z.string().optional(),
  difficulty: z.enum(["Facil", "Medio", "Dificil"], {
    required_error: "Dificultad requerida",
  }), // <-- Nuevo campo
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
});

export const BulkUpdateTasksSchema = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      status: z.nativeEnum(TaskStatus),
      position: z.number(),
    })
  ),
});

export type BulkUpdateTasksInput = z.infer<typeof BulkUpdateTasksSchema>;
