"use client";

import { useState, useEffect } from "react";
import { GamificationProfile } from "@/features/gamification/components/gamification-profile";
import { BadgeDisplay } from "@/features/gamification/components/badge-display";
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

export const GamificationClient = ({ workspaceId }: GamificationClientProps) => {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrent();
  const { data: allMembers, isLoading: isLoadingMember } = useGetMember({ workspaceId });
  
  // Fetch real gamification statistics
  const { data: gamificationStats, isLoading: isLoadingStats } = useGamificationStats({ workspaceId });

  // Persistent gamification data using localStorage and database
  const [gamificationData, setGamificationData] = useState({
    gamificationRole: "",
    points: 0,
    selectedIcons: [] as string[],
    aboutMe: "",
    earnedBadges: [] as string[],
  });

  // Find current user's member data
  const memberData = allMembers?.find(member => member.userId === currentUser?.id);

  // Load data from database and localStorage on component mount
  useEffect(() => {
    if (currentUser && memberData) {
      // Load from database first
      const dbData = {
        gamificationRole: memberData.gamificationRole || "",
        points: memberData.points || 0,
        selectedIcons: (() => {
          try {
            return memberData.selectedIcons ? JSON.parse(memberData.selectedIcons) : [];
          } catch (error) {
            console.warn('Error parsing selectedIcons:', error);
            return [];
          }
        })(),
        aboutMe: memberData.aboutMe || "",
        earnedBadges: (() => {
          try {
            return memberData.earnedBadges ? JSON.parse(memberData.earnedBadges) : [];
          } catch (error) {
            console.warn('Error parsing earnedBadges:', error);
            return [];
          }
        })(),
      };
      
      // Then check localStorage for any overrides (for UI responsiveness)
      const storageKey = `gamification_${currentUser.id}_${workspaceId}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          // Merge database data with localStorage data, prioritizing localStorage for UI fields
          setGamificationData({
            ...dbData,
            gamificationRole: parsedData.gamificationRole || dbData.gamificationRole,
            selectedIcons: parsedData.selectedIcons || dbData.selectedIcons,
            aboutMe: parsedData.aboutMe || dbData.aboutMe,
            points: dbData.points, // Always use database points
            earnedBadges: dbData.earnedBadges, // Always use database badges
          });
        } catch (error) {
          console.error('Error parsing saved gamification data:', error);
          setGamificationData(dbData);
        }
      } else {
        setGamificationData(dbData);
      }
    }
  }, [currentUser, workspaceId, memberData]);

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

  const handlePurchaseBadge = (badgeId: string) => {
    // TODO: Implement badge purchase logic
    console.log("Purchasing badge:", badgeId);
  };

  // Create member stats for badge system using real statistics
  const memberStats: MemberStats = gamificationStats || {
    totalTasksCompleted: 0,
    totalPoints: gamificationData.points,
    tasksCompletedByDifficulty: { Facil: 0, Medio: 0, Dificil: 0 },
    tasksCompletedToday: 0,
    currentStreak: 0,
    collaborativeTasks: 0,
    earnedBadges: gamificationData.earnedBadges,
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-6">
          <GamificationProfile
            user={user}
            gamificationData={gamificationData}
            onUpdate={handleUpdateGamification}
            onPurchaseBadge={handlePurchaseBadge}
          />
        </TabsContent>
        
        <TabsContent value="badges" className="mt-6">
          <BadgeDisplay
            memberStats={memberStats}
            onPurchaseBadge={handlePurchaseBadge}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
