"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useCurrent } from "../api/use-current";
import { useLogout } from "../api/use-logout";
import { Loader, LogOut, Settings, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { EditProfileModal } from "./edit-profile-modal";
import { VerifyEmailModal } from "./verify-email-modal";

const UserButton = () => {
  const { data: currentUser, isLoading } = useCurrent();
  const { mutate: logout } = useLogout();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isVerifyEmailOpen, setIsVerifyEmailOpen] = useState(false);
  const [currentEmail, setCurrentEmail] = useState("");

  if (isLoading) {
    return (
      <div className="size-10 rounded-full flex items-center justify-center bg-neutral-200 border border-neutral-300">
        <Loader className="size-4 animate text-muted-foreground" />
      </div>
    );
  }

  if (!currentUser) return null;

  const { name, email } = currentUser;

  const avatarFallback = name
    ? name.charAt(0).toUpperCase()
    : email.charAt(0).toUpperCase() ?? "U";

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="outline-none relative cursor-pointer">
        <Avatar className="size-10 hover:opacity-75 transition border border-neutral-300">
          <AvatarFallback className="bg-neutral-200 font-medium text-neutral-500 flex items-center justify-center">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        className="w-60"
        sideOffset={10}
      >
        <div className="flex flex-col items-center justify-center gap-2 px-2 5 py-4">
          <Avatar className="size-[52px]  transition border border-neutral-300">
            <AvatarFallback className="bg-neutral-200 text-xl font-medium text-neutral-500 flex items-center justify-center">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm font-medium text-neutral-900">
              {name || "User"}
            </p>
            <p className="text-xs text-neutral-500">{email}</p>
          </div>
        </div>
        <Separator className="mb-1" />
        <DropdownMenuItem
          onClick={() => setIsEditProfileOpen(true)}
          className="h-10 flex items-center px-3 text-neutral-700 hover:bg-neutral-50 cursor-pointer"
        >
          <Settings className="size-4 mr-3" />
          Edit Profile
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setIsVerifyEmailOpen(true)}
          className="h-10 flex items-center px-3 text-blue-700 hover:bg-blue-50 cursor-pointer"
        >
          <Mail className="size-4 mr-3" />
          Verify Email
        </DropdownMenuItem>
        <Separator className="my-1" />
        <DropdownMenuItem
          onClick={() => logout()}
          className="h-10 flex items-center px-3 text-red-700 hover:bg-red-50 font-medium cursor-pointer"
        >
          <LogOut className="size-4 mr-3" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>

      {/* Modals */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={{
          name: name || "",
          lastName: currentUser?.lastName || "",
          email: email || "",
        }}
        onEmailChanged={(newEmail) => {
          // Store the new email and open verify email modal
          setCurrentEmail(newEmail);
          setIsVerifyEmailOpen(true);
        }}
      />

      <VerifyEmailModal
        isOpen={isVerifyEmailOpen}
        onClose={() => {
          setIsVerifyEmailOpen(false);
          setCurrentEmail(""); // Reset when closing
        }}
        userEmail={currentEmail || email || ""}
        isEmailVerified={currentUser?.emailVerified || false}
      />
    </DropdownMenu>
  );
};

export default UserButton;
