import { redirect } from "next/navigation";
import { CommunityBoard } from "@/components/dashboard/community-board";
import { BackButton } from "@/components/ui/back-button";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";

export default async function CommunityPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/community");
  }

  if (sessionUser.role !== "student") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-background px-6 pb-24">
      <div className="mx-auto max-w-7xl space-y-6 pt-3">
        <BackButton href="/student" label="Back to dashboard" />
        <CommunityBoard />
      </div>
    </main>
  );
}