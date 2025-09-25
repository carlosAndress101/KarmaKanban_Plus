"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import {
  SettingsIcon,
  UsersIcon,
  TrophyIcon,
  ShoppingBagIcon,
  BookOpenIcon,
} from "lucide-react";
import {
  GoCheckCircle,
  GoCheckCircleFill,
  GoHome,
  GoHomeFill,
} from "react-icons/go";

import { useWorkspaceId } from "@/features/workspaces/hooks/useWorkspaceId";

const routes = [
  { label: "Home", href: "/", icon: GoHome, activeIcon: GoHomeFill },
  {
    label: "My Tasks",
    href: "/tasks",
    icon: GoCheckCircle,
    activeIcon: GoCheckCircleFill,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: SettingsIcon,
    activeIcon: SettingsIcon,
  },
  {
    label: "Members",
    href: "/members",
    icon: UsersIcon,
    activeIcon: UsersIcon,
  },
  {
    label: "Gamification",
    href: "/gamification",
    icon: TrophyIcon,
    activeIcon: TrophyIcon,
  },
  {
    label: "Store",
    href: "/store",
    icon: ShoppingBagIcon,
    activeIcon: ShoppingBagIcon,
  },
  {
    label: "What's New",
    href: "/patch-notes",
    icon: BookOpenIcon,
    activeIcon: BookOpenIcon,
  },
];

export const Navigation = () => {
  const workspaceId = useWorkspaceId();
  const pathname = usePathname();

  // Importar hook para saber si hay patch notes nuevas
  const { hasUnreadPatches, unreadPatchesCount } =
    require("@/features/patch-notes/hooks/usePatchNotes").usePatchNotes();

  return (
    <ul className="flex flex-col">
      {routes.map((item) => {
        // Si es patch notes, usar ruta con workspaceId
        const fullHref =
          item.href === "/patch-notes"
            ? `/workspaces/${workspaceId}/patch-notes`
            : `/workspaces/${workspaceId}${item.href}`;
        const isActive = pathname === fullHref;
        const Icon = isActive ? item.activeIcon : item.icon;

        return (
          <Link key={item.href} href={fullHref}>
            <div
              className={cn(
                "flex items-center gap-2.5 p-2.5 rounded-md font-medium hover:text-primary transition text-neutral-500",
                isActive && "bg-white shadow-sm hover:opacity-100 text-primary"
              )}
            >
              <Icon className="size-5 text-neutral-500" />
              {item.label}
              {/* Badge de notificación solo para patch notes */}
              {item.href === "/patch-notes" && hasUnreadPatches && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white animate-pulse">
                  {unreadPatchesCount > 9 ? "9+" : unreadPatchesCount}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </ul>
  );
};
