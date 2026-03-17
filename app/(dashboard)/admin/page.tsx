import { Sidebar } from "@/components/layout/sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { autoEscalateOverdueGrievances } from "@/lib/escalation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatGrievanceStatus, getDashboardPathForRole } from "@/lib/utils";

export default async function AdminDashboard() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/admin");
  }

  if (sessionUser.role !== "admin") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  await autoEscalateOverdueGrievances();

  const grievances = await prisma.grievance.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      category: true,
      urgency: true,
      status: true,
      departmentAssigned: true,
      escalatedAt: true,
      updatedAt: true,
      isAnonymous: true,
      votes: { select: { value: true } },
      follows: { select: { id: true } },
      comments: { select: { id: true } },
      student: { select: { name: true, department: true } },
    },
  });

  const total = await prisma.grievance.count();
  const resolved = await prisma.grievance.count({ where: { OR: [{ status: "Resolved" }, { status: "Closed" }] } });
  const critical = await prisma.grievance.count({ where: { OR: [{ urgency: "Critical" }, { urgency: "High" }] } });
  const escalated = await prisma.grievance.count({ where: { escalatedAt: { not: null } } });

  const stats = [
    { label: "Total", value: String(total) },
    { label: "Open", value: String(total - resolved) },
    { label: "Resolved", value: String(resolved) },
    { label: "Escalated", value: String(escalated) },
    { label: "High Priority", value: String(critical) },
  ];

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar
        items={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/grievances", label: "Grievances" },
          { href: "/analytics", label: "Analytics" },
          { href: "/patterns", label: "Patterns" },
          { href: "/ai-settings", label: "AI Settings" },
          { href: "/users", label: "Users" },
        ]}
      />
      <section className="flex-1 px-6 pb-10 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6 pt-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Dashboard</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Track volume, resolution pace, and hotspots across departments.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/analytics"
                className="rounded-full border border-border bg-background/50 px-5 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/20"
              >
                View analytics
              </Link>
              <Link
                href="/users"
                className="rounded-full bg-foreground px-5 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Manage users
              </Link>
            </div>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="clean-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{s.value}</p>
            </div>
          ))}
        </div>

          <div className="grid gap-6 lg:grid-cols-[1.35fr,1fr]">
            <div className="clean-card p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Latest grievances</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Monitor routing quality, response pace, and unresolved pain points.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/admin/grievances"
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/20"
                  >
                    View all
                  </Link>
                  <Link
                    href="/analytics"
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-foreground/20"
                  >
                    Open analytics
                  </Link>
                </div>
              </div>

          <div className="mt-6 space-y-3">
            {grievances.length === 0 && <p className="text-sm text-muted-foreground">No grievances have been submitted yet.</p>}
            {grievances.map((grievance) => (
              <div key={grievance.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background/50 p-4">
                <div>
                  <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    Support {(grievance.votes.filter((vote) => vote.value > 0).length - grievance.votes.filter((vote) => vote.value < 0).length)} · {grievance.follows.length} following · {grievance.comments.length} comments
                  </p>
                  <p className="text-sm font-medium text-foreground">{grievance.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {grievance.isAnonymous ? "Anonymous" : grievance.student.name} · {grievance.isAnonymous ? "Unknown Department" : (grievance.student.department || "Unknown Department")} · {grievance.departmentAssigned}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{grievance.category} · {grievance.urgency} · {formatGrievanceStatus(grievance.status)}</p>
                </div>
                <Link href={`/track/${grievance.id}`} className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Track</Link>
              </div>
            ))}
          </div>
        </div>

            <div className="clean-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Quick actions</h2>
              <p className="mt-1 text-sm text-muted-foreground">Common admin workflows.</p>
              <div className="mt-5 space-y-3">
                <Link href="/patterns" className="block rounded-2xl border border-border bg-background/40 p-4 transition-colors hover:border-foreground/20">
                  <p className="text-sm font-semibold text-foreground">Pattern analysis</p>
                  <p className="mt-1 text-xs text-muted-foreground">Find recurring categories and department hotspots.</p>
                </Link>
                <Link href="/ai-settings" className="block rounded-2xl border border-border bg-background/40 p-4 transition-colors hover:border-foreground/20">
                  <p className="text-sm font-semibold text-foreground">AI settings</p>
                  <p className="mt-1 text-xs text-muted-foreground">Manage the AI provider and model configuration.</p>
                </Link>
                <Link href="/users" className="block rounded-2xl border border-border bg-background/40 p-4 transition-colors hover:border-foreground/20">
                  <p className="text-sm font-semibold text-foreground">User management</p>
                  <p className="mt-1 text-xs text-muted-foreground">Add admins/department users and control access.</p>
                </Link>
              </div>
            </div>
          </div>

          <div className="clean-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Performance & distribution</h2>
            <p className="mt-1 text-sm text-muted-foreground">High level view of trends and workload split.</p>
            <div className="mt-6">
              <AnalyticsCharts />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
