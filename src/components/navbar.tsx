"use client";

import React from "react";
import UserButton from "@/features/auth/components/userButton";
import MobileSidebar from "./mobile-sidebar";
import { usePathname } from "next/navigation";

const pathnameMap = {
  tasks: {
    title: "My tasks",
    description: "View all your tasks here",
  },
  projects: {
    title: "My projects",
    description: "View all your projects here",
  },
};

const defaultMap = {
  title: "Karma Kanban",
  description: "Organize your projects and tasks here",
};

const Navbar = () => {
  const pathname = usePathname();
  const pathnameParts = pathname.split("/");
  const pathnameKey = pathnameParts[3] as keyof typeof pathnameMap;

  const { title, description } = pathnameMap[pathnameKey] || defaultMap;

  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <MobileSidebar />
      <div className="flex items-center gap-4">
        {/* Eliminado: Patch Notes Notification, solo sidebar */}
        <UserButton />
      </div>
    </nav>
  );
};

export default Navbar;
