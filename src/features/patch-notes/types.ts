export enum ChangeType {
  NEW_FEATURE = "NEW_FEATURE",
  IMPROVEMENT = "IMPROVEMENT",
  BUG_FIX = "BUG_FIX",
  BREAKING_CHANGE = "BREAKING_CHANGE",
  SECURITY = "SECURITY",
  PERFORMANCE = "PERFORMANCE",
  UI_UX = "UI_UX",
}

export enum PatchPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface PatchChange {
  id: string;
  type: ChangeType;
  title: string;
  description: string;
  details?: string[];
  affectedFeatures?: string[];
  imageUrl?: string;
}

export interface PatchNote {
  id: string;
  version: string;
  releaseDate: string;
  title: string;
  summary: string;
  priority: PatchPriority;
  changes: PatchChange[];
  isVisible: boolean;
  createdAt: string;
}

export interface UserPatchStatus {
  userId: string;
  lastSeenPatchId: string;
  seenPatches: string[];
  lastCheckDate: string;
}
