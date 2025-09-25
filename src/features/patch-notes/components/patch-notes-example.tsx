"use client";

import React from "react";
import {
  PatchNotesModal,
  PatchNotificationBadge,
} from "@/features/patch-notes";

export const PatchNotesExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleOpenPatchNotes = () => {
    setIsModalOpen(true);
  };

  const handleClosePatchNotes = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Notification Badge - Use in navbar or sidebar */}
      <PatchNotificationBadge
        onClick={handleOpenPatchNotes}
        variant="icon"
        showTooltip={true}
        size="md"
      />

      {/* Patch Notes Modal */}
      <PatchNotesModal
        isOpen={isModalOpen}
        onClose={handleClosePatchNotes}
        highlightLatest={true}
      />
    </>
  );
};
