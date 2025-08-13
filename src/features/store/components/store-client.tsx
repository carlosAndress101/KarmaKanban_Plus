"use client";

import { useState } from "react";
import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGetMember } from "@/features/members/api/useGetMember";
import { useGetStoreItems } from "../api/useGetStoreItems";
import { useCreateRedemption } from "../api/useCreateRedemption";
import { StoreItemCard } from "./store-item-card";
import { RedemptionModal } from "./redemption-modal";
import { StoreItem } from "../types";
import { Loader, ShoppingBag, Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const StoreClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: currentUser } = useCurrent();
  const { data: members } = useGetMember({ workspaceId });
  const { data: storeItems, isLoading } = useGetStoreItems({ workspaceId });
  const createRedemptionMutation = useCreateRedemption({ workspaceId });

  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("store");

  // Find current user's member data
  const currentMember = members?.find(member => member.userId === currentUser?.id);
  const userPoints = currentMember?.points ?? 0;
  
  // Check if user is Project Manager or Admin
  const isProjectManager = currentMember?.gamificationRole === "Project Manager" || currentMember?.role === "admin";

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
    // If Project Manager, show management interface even with empty store
    if (isProjectManager) {
      return (
        <div className="space-y-6">
          <Tabs value="management" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="store">Team Store</TabsTrigger>
              <TabsTrigger value="management">Store Management</TabsTrigger>
            </TabsList>
            
            <TabsContent value="store" className="mt-6">
              <div className="flex flex-col items-center justify-center h-64">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Items Available</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                  The store is currently empty. As a Project Manager, you can create items for your team!
                </p>
                <Button onClick={() => setActiveTab("management")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Store Items
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="management" className="mt-6">
              <div className="space-y-6">
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Welcome! As a Project Manager, you can create store items for your team to redeem with their points.
                  </AlertDescription>
                </Alert>
                
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Get Started</h3>
                    <p className="text-sm text-muted-foreground">Create your first store items for the team</p>
                  </div>
                </div>
                
                <div className="grid gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Create Your First Store Items</CardTitle>
                      <CardDescription>
                        Add rewards that team members can redeem with points earned from completing tasks.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Physical Item (Gift cards, merchandise, coffee vouchers)
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Digital Perk (Software licenses, online courses)
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Experience (Team lunch, workshop tickets)
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          Team Perk (Extra time off, premium parking)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      );
    }
    
    // Regular user with empty store
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

  // Store content component
  const StoreContent = () => (
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
    </div>
  );

  // Management content component
  const ManagementContent = () => (
    <div className="space-y-6">
      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          As a Project Manager, you can create and manage store items for your team to redeem.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Store Management</h3>
          <p className="text-sm text-muted-foreground">Create and manage rewards for your team</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add New Item
        </Button>
      </div>
      
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Create Store Items</CardTitle>
            <CardDescription>
              Add physical rewards, digital perks, experiences, or team benefits that members can redeem with their points.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Physical Item (Gift cards, merchandise, etc.)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Digital Perk (Software licenses, subscriptions, etc.)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Experience (Team events, workshops, etc.)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Team Perk (Extra time off, parking spot, etc.)
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Redemption Requests</CardTitle>
            <CardDescription>
              Review and approve team member redemption requests.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              View Pending Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // If user is Project Manager or Admin, show tabs
  if (isProjectManager) {
    return (
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="store">Team Store</TabsTrigger>
            <TabsTrigger value="management">Store Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="store" className="mt-6">
            <StoreContent />
          </TabsContent>
          
          <TabsContent value="management" className="mt-6">
            <ManagementContent />
          </TabsContent>
        </Tabs>
        
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
  }

  // Regular user view (no management features)
  return (
    <div className="space-y-6">
      <StoreContent />
      
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
