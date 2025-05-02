import { z } from 'zod';

export const WorkspaceScehma = z.object({
    id: z.string(),
    name: z.string().min(1),
    inviteCode: z.string()
});

export type Workspace = z.infer<typeof WorkspaceScehma>;