export interface StoreItem {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "Physical" | "Digital" | "Experience" | "Perk";
  isActive: boolean;
  stock: number | null; // null means unlimited
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RedemptionRequest {
  id: string;
  workspaceId: string;
  requesterId: string;
  storeItemId: string;
  pointsSpent: number;
  status: "pending" | "approved" | "rejected" | "fulfilled";
  notes?: string; // User's redemption notes
  adminNotes?: string; // Admin's approval/rejection notes
  reviewedBy?: string; // Admin who reviewed
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  // Joined fields
  requester?: {
    id: string;
    name: string;
    email: string;
  };
  storeItem?: StoreItem;
  reviewer?: {
    id: string;
    name: string;
  };
}

export type RedemptionStatus = RedemptionRequest["status"];
export type StoreCategory = StoreItem["category"];

export interface CreateStoreItemRequest {
  name: string;
  description: string;
  pointsCost: number;
  category: StoreCategory;
  stock?: number;
  imageUrl?: string;
}

export interface UpdateStoreItemRequest extends Partial<CreateStoreItemRequest> {
  isActive?: boolean;
}

export interface CreateRedemptionRequest {
  storeItemId: string;
  notes?: string;
}

export interface ReviewRedemptionRequest {
  status: "approved" | "rejected" | "fulfilled";
  adminNotes?: string;
}

// Store statistics
export interface StoreStats {
  totalItems: number;
  activeItems: number;
  totalRedemptions: number;
  pendingRedemptions: number;
  totalPointsRedeemed: number;
  popularItems: Array<{
    item: StoreItem;
    redemptionCount: number;
  }>;
}
