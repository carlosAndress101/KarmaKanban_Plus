"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StoreItem } from "../types";
import { Star } from "lucide-react";
import { useState } from "react";

interface RedemptionModalProps {
  item: StoreItem | null;
  userPoints: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  isLoading?: boolean;
}

export const RedemptionModal = ({
  item,
  userPoints,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RedemptionModalProps) => {
  const [notes, setNotes] = useState("");

  if (!item) return null;

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined);
    setNotes("");
  };

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Redemption</DialogTitle>
          <DialogDescription>
            You&apos;re about to redeem {item.name} for {item.pointsCost}{" "}
            points.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold">{item.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">
              {item.description}
            </p>

            <div className="flex items-center gap-1 mt-3">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold">{item.pointsCost}</span>
              <span className="text-sm text-muted-foreground">points</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Current Points:</span>
              <span className="font-semibold">{userPoints}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>After Redemption:</span>
              <span className="font-semibold">
                {userPoints - item.pointsCost}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or notes for your redemption..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Redemption"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
