import { StoreClient } from "@/features/store/components/store-client";

const StorePage = () => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Points Store</h1>
          <p className="text-muted-foreground">
            Redeem your earned points for exclusive rewards and perks
          </p>
        </div>
      </div>
      
      <StoreClient />
    </div>
  );
};

export default StorePage;
