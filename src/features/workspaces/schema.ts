import { z } from "zod";

export const createWorkspaceSchema = z.object({
    name: z.string().min(1, "Requerido").trim()
});
export const updateWorkspaceSchema = z.object({
    name: z.string().min(1, "Deberia tener mas de 1 caracter").trim().optional(),
});

