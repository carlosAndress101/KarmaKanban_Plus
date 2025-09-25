"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, Star, X, CheckCircle } from "lucide-react";

import { PatchNote, PatchChange, PatchPriority } from "../types";
import { ChangeTypeBadge } from "./change-type-icon";
import { usePatchNotes } from "../hooks/usePatchNotes";

interface PatchNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  highlightLatest?: boolean;
}

const PRIORITY_CONFIG = {
  [PatchPriority.LOW]: {
    color: "text-gray-600",
    bgColor: "bg-gray-50",
    label: "Low Priority",
  },
  [PatchPriority.MEDIUM]: {
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    label: "Medium Priority",
  },
  [PatchPriority.HIGH]: {
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    label: "High Priority",
  },
  [PatchPriority.CRITICAL]: {
    color: "text-red-600",
    bgColor: "bg-red-50",
    label: "Critical",
  },
};

export const PatchNotesModal: React.FC<PatchNotesModalProps> = ({
  isOpen,
  onClose,
  highlightLatest = false,
}) => {
  const { latestPatch, allPatches, markPatchAsSeen, markAllPatchesAsSeen } =
    usePatchNotes();
  const [selectedPatch, setSelectedPatch] = React.useState<PatchNote | null>(
    null
  );

  React.useEffect(() => {
    if (isOpen && highlightLatest && latestPatch) {
      setSelectedPatch(latestPatch);
    } else if (isOpen && allPatches.length > 0) {
      setSelectedPatch(allPatches[0]);
    }
  }, [isOpen, highlightLatest, latestPatch, allPatches]);

  const handleClose = () => {
    if (selectedPatch) {
      markPatchAsSeen(selectedPatch.id);
    }
    onClose();
  };

  const handleMarkAllRead = () => {
    markAllPatchesAsSeen();
    onClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderPatchChange = (change: PatchChange) => (
    <div key={change.id} className="space-y-3 p-4 rounded-lg bg-gray-50">
      <div className="flex items-start gap-3">
        <ChangeTypeBadge type={change.type} size="sm" />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{change.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{change.description}</p>
        </div>
      </div>

      {change.details && change.details.length > 0 && (
        <div className="ml-6">
          <ul className="space-y-1">
            {change.details.map((detail, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-600"
              >
                <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {change.affectedFeatures && change.affectedFeatures.length > 0 && (
        <div className="ml-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Affected features:</span>
            {change.affectedFeatures.map((feature) => (
              <Badge key={feature} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPatchDetails = (patch: PatchNote) => (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-sm font-mono">
              v{patch.version}
            </Badge>
            <Badge
              className={`${PRIORITY_CONFIG[patch.priority].bgColor} ${
                PRIORITY_CONFIG[patch.priority].color
              }`}
            >
              {PRIORITY_CONFIG[patch.priority].label}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            {formatDate(patch.releaseDate)}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {patch.title}
          </h3>
          <p className="text-gray-600">{patch.summary}</p>
        </div>
      </div>

      <Separator />

      {/* Changes */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          What&apos;s New ({patch.changes.length} changes)
        </h4>
        <div className="space-y-4">{patch.changes.map(renderPatchChange)}</div>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        <div className="flex h-full">
          {/* Sidebar with patch list */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  What&apos;s New
                </DialogTitle>
                <DialogDescription>
                  Stay updated with the latest features and improvements
                </DialogDescription>
              </DialogHeader>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {allPatches.map((patch) => (
                  <button
                    key={patch.id}
                    onClick={() => setSelectedPatch(patch)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedPatch?.id === patch.id
                        ? "bg-blue-50 border-blue-200"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-mono text-gray-500">
                        v{patch.version}
                      </span>
                      {patch.id === latestPatch?.id && (
                        <Badge className="text-xs bg-green-100 text-green-800">
                          Latest
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                      {patch.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(patch.releaseDate)}
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-gray-200 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                className="w-full"
              >
                Mark All as Read
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {highlightLatest && (
                  <Badge className="bg-green-100 text-green-800">
                    🎉 New Update Available
                  </Badge>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                {selectedPatch ? (
                  renderPatchDetails(selectedPatch)
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    Select a patch to view details
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
