"use client";

import { useState } from "react";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetStoreItems } from "../api/useGetStoreItems";
import { useCreateRedemption } from "../api/useCreateRedemption";
import { StoreItemCard } from "./store-item-card";
import { RedemptionModal } from "./redemption-modal";
import { StoreItem } from "../types";
import { Loader, ShoppingBag } from "lucide-react";

export const StoreClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const { data: storeItems, isLoading } = useGetStoreItems({ workspaceId });
  const createRedemptionMutation = useCreateRedemption({ workspaceId });

  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userPoints = currentUser?.member?.points ?? 0;

  const handleRedeem = (item: StoreItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleConfirmRedemption = (notes?: string) => {
    if (!selectedItem) return;

    createRedemptionMutation.mutate(
      {
        json: {
          storeItemId: selectedItem.id,
          notes,
        },
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setSelectedItem(null);
        },
      }
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!storeItems || storeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Items Available</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          The store is currently empty. Check back later for exclusive rewards and perks!
        </p>
      </div>
    );
  }

  // Group items by category
  const itemsByCategory = storeItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, StoreItem[]>);

  return (
    <div className="space-y-8">
      {/* User Points Display */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your Points</h2>
            <p className="text-gray-600 mt-1">Redeem your points for exclusive rewards</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-blue-600">{userPoints}</div>
            <div className="text-sm text-gray-500">available points</div>
          </div>
        </div>
      </div>

      {/* Store Items by Category */}
      {Object.entries(itemsByCategory).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 border-b pb-2">
            {category} Items
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <StoreItemCard
                key={item.id}
                item={item}
                userPoints={userPoints}
                onRedeem={handleRedeem}
                isRedeeming={
                  createRedemptionMutation.isPending && selectedItem?.id === item.id
                }
              />
            ))}
          </div>
        </div>
      ))}

      {/* Redemption Confirmation Modal */}
      <RedemptionModal
        item={selectedItem}
        userPoints={userPoints}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmRedemption}
        isLoading={createRedemptionMutation.isPending}
      />
    </div>
  );
};
