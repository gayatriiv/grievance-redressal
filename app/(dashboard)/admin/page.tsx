import { Sidebar } from "@/components/layout/sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
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

  const grievances = await prisma.grievance.findMany({
    orderBy: { updatedAt: "desc" },
    take: 10,
    select: {
      id: true,
      title: true,
      category: true,
      urgency: true,
      status: true,
      departmentAssigned: true,
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

  const stats = [
    { label: "Total", value: String(total) },
    { label: "Open", value: String(total - resolved) },
    { label: "Resolved", value: String(resolved) },
    { label: "High Priority", value: String(critical) },
  ];

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={[{ href: "/admin", label: "All Grievances" }, { href: "/analytics", label: "Analytics" }, { href: "/patterns", label: "Patterns" }, { href: "/ai-settings", label: "AI Settings" }]} />
      <section className="flex-1 space-y-6 px-8 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Overview of all grievances, pattern analysis, and accountability metrics.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border/50 bg-background/50 p-3">
              <p className="text-xs font-semibold text-foreground">🤖 AI-Powered Classification</p>
              <p className="mt-1 text-xs text-muted-foreground">Categorizes complaints using NLP for faster resolution and intelligent routing.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 p-3">
              <p className="text-xs font-semibold text-foreground">📊 Pattern Analysis</p>
              <p className="mt-1 text-xs text-muted-foreground">Identifies recurring problems through pattern analysis to prevent future issues.</p>
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

        <div className="clean-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Latest Grievances</h2>
              <p className="mt-1 text-sm text-muted-foreground">Monitor routing quality, response pace, and unresolved institutional pain points.</p>
            </div>
            <Link href="/analytics" className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/20">Open Analytics</Link>
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

        <AnalyticsCharts />
      </section>
    </main>
  );
}
