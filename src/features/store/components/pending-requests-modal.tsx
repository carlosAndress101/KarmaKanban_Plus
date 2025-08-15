import { useState } from "react";
import { useGetRedemptions } from "../api/useGetRedemptions";
import { useReviewRedemption } from "../api/useReviewRedemption";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";
import { toast } from "sonner";

interface PendingRequestsModalProps {
  workspaceId: string;
  open: boolean;
  onClose: () => void;
}

export const PendingRequestsModal = ({
  workspaceId,
  open,
  onClose,
}: PendingRequestsModalProps) => {
  const {
    data: requests,
    isLoading,
    refetch,
  } = useGetRedemptions({ workspaceId });
  const reviewMutation = useReviewRedemption({ workspaceId });
  const [adminNotes, setAdminNotes] = useState<{ [id: string]: string }>({});
  const [processingId, setProcessingId] = useState<string | null>(null);

  const pendingRequests = (requests || []).filter(
    (r) => r.status === "pending"
  );

  const handleAction = async (
    requestId: string,
    status: "approved" | "rejected"
  ) => {
    setProcessingId(requestId);
    reviewMutation.mutate(
      {
        requestId,
        data: {
          status,
          adminNotes: adminNotes[requestId] || undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Request ${
              status === "approved"
                ? "approved"
                : "rejected and points refunded"
            }`
          );
          setAdminNotes((prev) => ({ ...prev, [requestId]: "" }));
          refetch();
        },
        onError: (e: any) => {
          toast.error(e.message || "Failed to update request");
        },
        onSettled: () => setProcessingId(null),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pending Redemption Requests</DialogTitle>
          <DialogDescription>
            Review and approve or reject team member requests. Rejected requests
            will refund points to the user.
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No pending requests.
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="border">
                <CardContent className="py-4 flex flex-col gap-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <div className="font-semibold">
                        {req.requester?.name
                          ? req.requester.name
                          : req.requesterName
                          ? req.requesterName
                          : req.requesterId}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {req.requester?.email}
                      </div>
                      <div className="mt-1 text-sm">
                        <span className="font-medium">Item:</span>{" "}
                        {req.storeItem?.name
                          ? req.storeItem.name
                          : req.itemName
                          ? req.itemName
                          : req.storeItemId}{" "}
                        <span className="ml-2 font-medium">Points:</span>{" "}
                        {req.pointsSpent}
                      </div>
                      {req.notes && (
                        <div className="mt-1 text-xs text-muted-foreground">
                          User note: {req.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 min-w-[180px]">
                      <Textarea
                        placeholder="Admin notes (optional)"
                        value={adminNotes[req.id] || ""}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({
                            ...prev,
                            [req.id]: e.target.value,
                          }))
                        }
                        className="text-sm"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="success"
                          disabled={
                            processingId === req.id || reviewMutation.isPending
                          }
                          onClick={() => handleAction(req.id, "approved")}
                        >
                          {processingId === req.id && reviewMutation.isPending
                            ? "Processing..."
                            : "Approve"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={
                            processingId === req.id || reviewMutation.isPending
                          }
                          onClick={() => handleAction(req.id, "rejected")}
                        >
                          {processingId === req.id && reviewMutation.isPending
                            ? "Processing..."
                            : "Reject"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
