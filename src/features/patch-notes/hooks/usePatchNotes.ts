"use client";

import { useState, useEffect, useCallback } from "react";
import { PatchNote, UserPatchStatus } from "../types";
import {
  getLatestPatch,
  getVisiblePatches,
  hasNewPatchesSince,
} from "../data/patches";

const STORAGE_KEY = "karmakanban-patch-status";

interface UsePatchNotesReturn {
  latestPatch: PatchNote | undefined;
  allPatches: PatchNote[];
  hasNewPatches: boolean;
  hasUnreadPatches: boolean;
  unreadPatchesCount: number;
  isFirstTime: boolean;
  markPatchAsSeen: (patchId: string) => void;
  markAllPatchesAsSeen: () => void;
  getUserPatchStatus: () => UserPatchStatus | null;
  resetPatchStatus: () => void;
}

export const usePatchNotes = (): UsePatchNotesReturn => {
  const [patchStatus, setPatchStatus] = useState<UserPatchStatus | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load patch status from localStorage on mount
  useEffect(() => {
    const savedStatus = localStorage.getItem(STORAGE_KEY);
    if (savedStatus) {
      try {
        const parsed = JSON.parse(savedStatus) as UserPatchStatus;
        setPatchStatus(parsed);
      } catch (error) {
        console.error("Error parsing patch status from localStorage:", error);
        // Reset if corrupted
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save patch status to localStorage whenever it changes
  useEffect(() => {
    if (patchStatus && isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patchStatus));
    }
  }, [patchStatus, isLoaded]);

  const latestPatch = getLatestPatch();
  const allPatches = getVisiblePatches();
  const isFirstTime = !patchStatus;

  const hasNewPatches = useCallback(() => {
    if (!patchStatus || !latestPatch) return true;
    return hasNewPatchesSince(patchStatus.lastSeenPatchId);
  }, [patchStatus, latestPatch]);

  const markPatchAsSeen = useCallback((patchId: string) => {
    const currentTime = new Date().toISOString();

    setPatchStatus((prev) => {
      if (!prev) {
        // First time user
        return {
          userId: "current-user", // This would be replaced with actual user ID
          lastSeenPatchId: patchId,
          seenPatches: [patchId],
          lastCheckDate: currentTime,
        };
      }

      // Update existing status
      const updatedSeenPatches = prev.seenPatches.includes(patchId)
        ? prev.seenPatches
        : [...prev.seenPatches, patchId];

      return {
        ...prev,
        lastSeenPatchId: patchId,
        seenPatches: updatedSeenPatches,
        lastCheckDate: currentTime,
      };
    });
  }, []);

  const markAllPatchesAsSeen = useCallback(() => {
    if (!latestPatch) return;

    const currentTime = new Date().toISOString();
    const allPatchIds = allPatches.map((patch) => patch.id);

    setPatchStatus((prev) => ({
      userId: prev?.userId || "current-user",
      lastSeenPatchId: latestPatch.id,
      seenPatches: allPatchIds,
      lastCheckDate: currentTime,
    }));
  }, [latestPatch, allPatches]);

  const resetPatchStatus = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPatchStatus(null);
  }, []);

  const getUserPatchStatus = useCallback(() => {
    return patchStatus;
  }, [patchStatus]);

  const hasUnreadPatches = hasNewPatches();

  const unreadPatchesCount = useCallback(() => {
    if (!patchStatus) return allPatches.length;

    const unreadPatches = allPatches.filter(
      (patch) => !patchStatus.seenPatches.includes(patch.id)
    );
    return unreadPatches.length;
  }, [patchStatus, allPatches]);

  return {
    latestPatch,
    allPatches,
    hasNewPatches: hasNewPatches(),
    hasUnreadPatches,
    unreadPatchesCount: unreadPatchesCount(),
    isFirstTime,
    markPatchAsSeen,
    markAllPatchesAsSeen,
    getUserPatchStatus,
    resetPatchStatus,
  };
};
