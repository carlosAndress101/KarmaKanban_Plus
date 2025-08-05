"use client";

import { useState, useEffect } from "react";
import { GamificationProfile } from "@/features/gamification/components/gamification-profile";
import { useGetMember } from "@/features/members/api/useGetMember";
import { useCurrent } from "@/features/auth/api/use-current";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

interface GamificationClientProps {
  workspaceId: string;
}

export const GamificationClient = ({ workspaceId }: GamificationClientProps) => {
  const { data: currentUser, isLoading: isLoadingUser } = useCurrent();
  const { data: allMembers, isLoading: isLoadingMember } = useGetMember({ workspaceId });

  // Persistent gamification data using localStorage and database
  const [gamificationData, setGamificationData] = useState({
    gamificationRole: "",
    points: 0,
    selectedIcons: [] as string[],
    aboutMe: "",
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
        selectedIcons: memberData.selectedIcons ? JSON.parse(memberData.selectedIcons) : [],
        aboutMe: memberData.aboutMe || "",
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

  if (isLoadingUser || isLoadingMember) {
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
    <div className="w-full">
      <GamificationProfile
        user={user}
        gamificationData={gamificationData}
        onUpdate={handleUpdateGamification}
      />
    </div>
  );
};
