import { redirect } from "next/navigation";
import { GrievanceTracker } from "@/components/dashboard/grievance-tracker";
import { Navbar } from "@/components/layout/navbar";
import { BackButton } from "@/components/ui/back-button";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";

export default async function TrackPage({ params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect(`/login?callbackUrl=/track/${params.id}`);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background px-6 pb-24 pt-[4.75rem]">
        <div className="mx-auto max-w-7xl space-y-6 pt-3">
          <BackButton href={getDashboardPathForRole(sessionUser.role)} label="Back to dashboard" />
          <GrievanceTracker grievanceId={params.id} role={sessionUser.role} />
        </div>
      </main>
    </>
  );
}

