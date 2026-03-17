import Link from "next/link";
import { LayoutDashboard, User, ListChecks, FileText, MessageSquare, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatGrievanceStatus, getDashboardPathForRole } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";

export default async function StudentDashboard() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/student");
  }

  if (sessionUser.role !== "student") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  const grievances = await prisma.grievance.findMany({
    where: { studentId: sessionUser.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      category: true,
      departmentAssigned: true,
      updatedAt: true,
    },
  });

  const allGrievancesForStats = await prisma.grievance.findMany({
    select: {
      status: true,
      category: true,
    },
  });

  const total = grievances.length;
  const resolved = grievances.filter(
    (grievance) => grievance.status === "Resolved" || grievance.status === "Closed",
  ).length;
  const open = total - resolved;
  const latestGrievance = grievances[0];

  const systemTotal = allGrievancesForStats.length;
  const systemResolved = allGrievancesForStats.filter(
    (g) => g.status === "Resolved" || g.status === "Closed",
  ).length;
  const systemOpen = systemTotal - systemResolved;

  const categoryCounts = allGrievancesForStats.reduce<Record<string, number>>((acc, g) => {
    acc[g.category] = (acc[g.category] || 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const maxCategoryCount = topCategories[0]?.[1] ?? 0;

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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your grievances and track resolutions.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Your Grievances</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{total}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {resolved} resolved · {open} open
            </p>
          </div>
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">All Students (System)</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{systemTotal}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {systemResolved} resolved · {systemOpen} open
            </p>
          </div>
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Top Categories</p>
            <div className="mt-3 space-y-2">
              {topCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">No grievances have been filed yet.</p>
              )}
              {topCategories.map(([category, count]) => (
                <div key={category}>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="truncate">{category}</span>
                    <span>{count}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-border">
                    <div
                      className="h-1.5 rounded-full bg-foreground/70"
                      style={{
                        width: `${maxCategoryCount ? Math.max((count / maxCategoryCount) * 100, 10) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="clean-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Recent Grievances</h2>
              <p className="mt-1 text-sm text-muted-foreground">Track status changes, see assigned departments, and jump straight into the conversation.</p>
            </div>
            <Link href="/submit-grievance" className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/20">New Grievance</Link>
          </div>

          <div className="mt-6 space-y-3">
            {grievances.length === 0 && <p className="text-sm text-muted-foreground">No grievances filed yet. Submit your first grievance to start the process.</p>}
            {grievances.map((grievance) => (
              <div key={grievance.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background/50 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{grievance.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{grievance.category} · {grievance.departmentAssigned} · {formatGrievanceStatus(grievance.status)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/track/${grievance.id}`} className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/20">Track</Link>
                  <Link href={`/chat?grievanceId=${grievance.id}`} className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Chat</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
