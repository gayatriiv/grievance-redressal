import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatGrievanceStatus, getDashboardPathForRole } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, User, ListChecks, FileText, MessageSquare, Users } from "lucide-react";

export default async function StudentGrievancesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/student/grievances");
  }

  if (sessionUser.role !== "student") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  const grievances = await prisma.grievance.findMany({
    where: { studentId: sessionUser.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      status: true,
      category: true,
      departmentAssigned: true,
      updatedAt: true,
    },
  });

  const sidebarItems = [
    {
      href: "/student",
      label: "Main Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: "/student/profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
    },
    {
      href: "/student/grievances",
      label: "Track Grievances",
      icon: <ListChecks className="h-4 w-4" />,
    },
    {
      href: "/submit-grievance",
      label: "Submit Grievance",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      href: "/chat",
      label: "Chat with Department",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      href: "/community",
      label: "Community Discussion",
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={sidebarItems} workspaceTitle="Student Portal" />
      <section className="flex-1 space-y-8 px-6 pb-24 pt-3 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Track Grievances</h1>
            <p className="mt-2 text-sm text-muted-foreground">Track every grievance you have submitted to the institute.</p>
          </div>
          <Link
            href="/submit-grievance"
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            New Grievance
          </Link>
        </div>

        <div className="clean-card p-6">
          <div className="mt-2 space-y-3">
            {grievances.length === 0 && (
              <p className="text-sm text-muted-foreground">
                You have not submitted any grievances yet. Once you file a complaint, it will appear here for tracking.
              </p>
            )}
            {grievances.map((grievance) => (
              <div
                key={grievance.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background/50 p-4"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{grievance.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {grievance.category} · {grievance.departmentAssigned} · {formatGrievanceStatus(grievance.status)}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Last updated {grievance.updatedAt.toLocaleDateString()}{" "}
                    {grievance.updatedAt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/track/${grievance.id}`}
                    className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/20"
                  >
                    Track
                  </Link>
                  <Link
                    href={`/chat?grievanceId=${grievance.id}`}
                    className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    Chat
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

