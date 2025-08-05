import { getCurrent } from "@/features/auth/actions";
import { redirect } from "next/navigation";
import { GamificationClient } from "./client";

interface GamificationPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function GamificationPage({ params }: GamificationPageProps) {
  const user = await getCurrent();
  if (!user) redirect("/sign-in");

  const { workspaceId } = await params;

  return (
    <div className="h-full w-full">
      <GamificationClient workspaceId={workspaceId} />
    </div>
  );
}
