import { Sidebar } from "@/components/layout/sidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatGrievanceStatus, getDashboardPathForRole, normalizeDepartmentName } from "@/lib/utils";

export default async function DepartmentDashboard() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/department");
  }

  if (sessionUser.role !== "department") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  const department = normalizeDepartmentName(sessionUser.department);
  const grievances = department
    ? await prisma.grievance.findMany({
        where: { departmentAssigned: department },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          updatedAt: true,
          student: { select: { name: true, rollNumber: true } },
        },
      })
    : [];

  const inProgress = grievances.filter((grievance) => ["Assigned", "InProgress", "UnderReview"].includes(grievance.status)).length;
  const resolved = grievances.filter((grievance) => grievance.status === "Resolved" || grievance.status === "Closed").length;

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={[{ href: "/department", label: "Assigned Cases" }, { href: "/department/chat", label: "Student Chat" }]} />
      <section className="flex-1 space-y-6 p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Department Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage assigned cases for {department || "your department"} and respond to students.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border/50 bg-background/50 p-3">
              <p className="text-xs font-semibold text-foreground">🤖 AI-Powered Classification</p>
              <p className="mt-1 text-xs text-muted-foreground">Incoming complaints are categorized using NLP for faster resolution.</p>
            </div>
            <div className="rounded-lg border border-border/50 bg-background/50 p-3">
              <p className="text-xs font-semibold text-foreground">📊 Pattern Insights</p>
              <p className="mt-1 text-xs text-muted-foreground">Recurring issues are identified to help your department address root causes.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Assigned Cases</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{grievances.length}</p>
          </div>
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Follow-ups</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{inProgress}</p>
          </div>
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Resolved</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{resolved}</p>
          </div>
        </div>

        <div className="clean-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Assigned Queue</h2>
              <p className="mt-1 text-sm text-muted-foreground">Academic and faculty complaints assigned to your department appear here automatically.</p>
            </div>
            <Link href="/department/chat" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Open Chat Console</Link>
          </div>

          <div className="mt-6 space-y-3">
            {grievances.length === 0 && <p className="text-sm text-muted-foreground">No grievances are assigned to your department right now.</p>}
            {grievances.map((grievance) => (
              <div key={grievance.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-background/50 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{grievance.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{grievance.category} · {grievance.student.name} {grievance.student.rollNumber ? `(${grievance.student.rollNumber})` : ""} · {formatGrievanceStatus(grievance.status)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Link href={`/track/${grievance.id}`} className="rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/20">Track</Link>
                  <Link href={`/department/chat?grievanceId=${grievance.id}`} className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">Reply</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
