"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreItem } from "../types";
import { Star, Package, Zap, Heart, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface StoreItemCardProps {
  item: StoreItem;
  userPoints: number;
  onRedeem: (item: StoreItem) => void;
  isRedeeming?: boolean;
}

const categoryIcons = {
  Physical: Package,
  Digital: Monitor,
  Experience: Zap,
  Perk: Heart,
};

const categoryColors = {
  Physical: "bg-blue-50 text-blue-700 border-blue-200",
  Digital: "bg-purple-50 text-purple-700 border-purple-200",
  Experience: "bg-orange-50 text-orange-700 border-orange-200", 
  Perk: "bg-pink-50 text-pink-700 border-pink-200",
};

export const StoreItemCard = ({
  item,
  userPoints,
  onRedeem,
  isRedeeming = false,
}: StoreItemCardProps) => {
  const Icon = categoryIcons[item.category];
  const canAfford = userPoints >= item.pointsCost;
  const isOutOfStock = item.stock !== null && item.stock <= 0;
  const isAvailable = canAfford && !isOutOfStock && item.isActive;

  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      !isAvailable && "opacity-60"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg font-semibold">{item.name}</CardTitle>
          </div>
          <Badge className={cn("text-xs", categoryColors[item.category])}>
            {item.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground mb-4">
          {item.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500" />
            <span className="font-semibold text-lg">{item.pointsCost}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>

          {item.stock !== null && (
            <div className="text-sm text-muted-foreground">
              Stock: {item.stock}
            </div>
          )}
        </div>

        {!canAfford && (
          <div className="mt-2 text-sm text-red-600">
            Need {item.pointsCost - userPoints} more points
          </div>
        )}

        {isOutOfStock && (
          <div className="mt-2 text-sm text-red-600">
            Out of stock
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          onClick={() => onRedeem(item)}
          disabled={!isAvailable || isRedeeming}
          className="w-full"
          variant={isAvailable ? "default" : "secondary"}
        >
          {isRedeeming ? "Redeeming..." : "Redeem"}
        </Button>
      </CardFooter>
    </Card>
  );
};
