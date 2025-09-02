"use client";

import { useState, useEffect } from "react";
import { GamificationProfile } from "@/features/gamification/components/gamification-profile";
import { GamificationStats } from "@/features/gamification/components/gamification-stats";
import { BadgeDisplay } from "@/features/gamification/components/badge-display";
import { GamificationHistoryTabs } from "@/features/gamification/components/GamificationHistoryTabs";
import { useGetMember } from "@/features/members/api/useGetMember";
import { useCurrent } from "@/features/auth/api/use-current";
import { useGamificationStats } from "@/features/gamification/api/useGamificationStats";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { MemberStats } from "@/features/gamification/utils/badge-manager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GamificationClientProps {
  workspaceId: string;
}

export const GamificationClient = ({
  workspaceId,
}: GamificationClientProps) => {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrent();
  const { data: allMembers, isLoading: isLoadingMember } = useGetMember({
    workspaceId,
  });

  // Fetch real gamification statistics
  const { data: gamificationStats, isLoading: isLoadingStats } =
    useGamificationStats({ workspaceId });

  // Persistent gamification data using localStorage and database
  const [gamificationData, setGamificationData] = useState({
    gamificationRole: "",
    points: 0,
    selectedIcons: [] as string[],
    aboutMe: "",
    earnedBadges: [] as string[],
  });

  // Find current user's member data
  const memberData = allMembers?.find(
    (member) => member.userId === currentUser?.id
  );

  // Fetch earned badges from backend history endpoint
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  useEffect(() => {
    if (memberData?.id && workspaceId) {
      fetch(
        `${
          process.env.NEXT_PUBLIC_BASE_PATH || ""
        }/api/gamification/badges-history?workspaceId=${workspaceId}&memberId=${
          memberData.id
        }`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.data)) {
            setEarnedBadges(
              data.data.map((b: unknown) => {
                if (b && typeof b === "object" && "id" in b) {
                  return (b as { id: string }).id;
                }
                return "";
              })
            );
          }
        });
    }
  }, [memberData?.id, workspaceId]);
  // Load data from database and localStorage on component mount
  useEffect(() => {
    if (currentUser && memberData && gamificationStats !== undefined) {
      // Use real-time data from API and database
      const realPoints =
        gamificationStats?.totalPoints ?? memberData.points ?? 0;

      const dbData = {
        gamificationRole: memberData.gamificationRole || "",
        points: realPoints, // Use real-time points
        selectedIcons: (() => {
          try {
            return memberData.selectedIcons
              ? JSON.parse(memberData.selectedIcons)
              : [];
          } catch (error) {
            console.warn("Error parsing selectedIcons:", error);
            return [];
          }
        })(),
        aboutMe: memberData.aboutMe || "",
        earnedBadges: earnedBadges, // Use backend history badges
      };

      // Then check localStorage for UI-only overrides
      const storageKey = `gamification_${currentUser.id}_${workspaceId}`;
      const savedData = localStorage.getItem(storageKey);

      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Merge database data with localStorage data, but always prioritize real-time stats
          setGamificationData({
            ...dbData,
            gamificationRole:
              parsedData.gamificationRole || dbData.gamificationRole,
            selectedIcons: parsedData.selectedIcons || dbData.selectedIcons,
            aboutMe: parsedData.aboutMe || dbData.aboutMe,
            points: realPoints, // Always use real-time points
            earnedBadges: earnedBadges, // Always use backend history badges
          });
        } catch (error) {
          console.error("Error parsing saved gamification data:", error);
          setGamificationData(dbData);
        }
      } else {
        setGamificationData(dbData);
      }
    }
  }, [currentUser, workspaceId, memberData, gamificationStats, earnedBadges]);

  const handleUpdateGamification = (data: {
    gamificationRole?: string;
    selectedIcons: string[];
    aboutMe?: string;
  }) => {
    const updatedData = {
      ...gamificationData,
      ...data,
    };

    setGamificationData(updatedData);

    // Save to localStorage
    if (currentUser) {
      const storageKey = `gamification_${currentUser.id}_${workspaceId}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedData));
    }

    // TODO: Here you would make an API call to update the member's gamification data
    console.log("Updating gamification data:", updatedData);
  };

  // Create member stats for badge system using real statistics
  const realPoints = gamificationStats?.totalPoints ?? memberData?.points ?? 0;

  // Use earnedBadges from backend history
  const realEarnedBadges = earnedBadges;

  const memberStats: MemberStats = {
    totalTasksCompleted: gamificationStats?.totalTasksCompleted ?? 0,
    totalPoints: realPoints,
    tasksCompletedByDifficulty:
      gamificationStats?.tasksCompletedByDifficulty ?? {
        Easy: 0,
        Medium: 0,
        Hard: 0,
      },
    tasksCompletedToday: gamificationStats?.tasksCompletedToday ?? 0,
    currentStreak: gamificationStats?.currentStreak ?? 0,
    collaborativeTasks: gamificationStats?.collaborativeTasks ?? 0,
    earnedBadges: realEarnedBadges,
    // averageCompletionTime is not part of MemberStats interface, but we pass it separately
  };

  // Update the gamificationData to use real points from the API
  const updatedGamificationData = {
    ...gamificationData,
    points: realPoints,
    totalTasksCompleted: memberStats.totalTasksCompleted,
    tasksCompletedByDifficulty: memberStats.tasksCompletedByDifficulty,
    earnedBadges: realEarnedBadges,
  };

  if (isLoadingUser || isLoadingMember || isLoadingStats) {
    return <PageLoader />;
  }

  if (!currentUser || !memberData) {
    return <PageError message="Unable to load user data" />;
  }

  const user = {
    id: currentUser.id,
    name: currentUser.name,
    lastName: currentUser.lastName || "",
    email: currentUser.email,
    avatar: undefined, // You can add avatar support later
  };

  return (
    <div className="w-full space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <GamificationProfile
            user={user}
            gamificationData={updatedGamificationData}
            onUpdate={handleUpdateGamification}
          />
          <GamificationStats
            totalTasksCompleted={memberStats.totalTasksCompleted}
            tasksCompletedByDifficulty={memberStats.tasksCompletedByDifficulty}
            tasksCompletedToday={memberStats.tasksCompletedToday}
            currentStreak={memberStats.currentStreak}
            averageCompletionTime={gamificationStats?.averageCompletionTime}
            averageCompletionTimeByDifficulty={
              gamificationStats?.averageCompletionTimeByDifficulty
            }
          />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <BadgeDisplay memberStats={memberStats} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <GamificationHistoryTabs
            workspaceId={workspaceId}
            memberId={memberData.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
