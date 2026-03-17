import { redirect } from "next/navigation";
import { GrievanceChat } from "@/components/dashboard/grievance-chat";
import { BackButton } from "@/components/ui/back-button";
import { autoEscalateOverdueGrievances } from "@/lib/escalation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";

export default async function StudentChatPage({ searchParams }: { searchParams?: { grievanceId?: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/chat");
  }

  if (sessionUser.role !== "student") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  await autoEscalateOverdueGrievances();

  const grievances = await prisma.grievance.findMany({
    where: { studentId: sessionUser.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      status: true,
      departmentAssigned: true,
      updatedAt: true,
    },
  });

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-background px-6 pb-24">
      <div className="mx-auto max-w-7xl space-y-6 pt-3">
        <BackButton href="/student" label="Back to dashboard" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Chat with Assigned Department</h1>
          <p className="mt-2 text-sm text-muted-foreground">Ask for updates, share additional context, and keep a transparent record of the resolution process.</p>
        </div>
        <GrievanceChat
          grievances={grievances.map((grievance) => ({ ...grievance, updatedAt: grievance.updatedAt.toISOString() }))}
          role="student"
          defaultGrievanceId={searchParams?.grievanceId}
          emptyMessage="No grievances have been filed yet. Submit a grievance first to start a conversation with the assigned department."
        />
      </div>
    </main>
  );
}
