import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";
import { BackButton } from "@/components/ui/back-button";
import { PatternChart } from "@/components/dashboard/pattern-chart";
import { Sidebar } from "@/components/layout/sidebar";
import Link from "next/link";

export default async function PatternsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/patterns");
  }

  if (sessionUser.role !== "admin") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  // Fetch all grievances grouped by category
  const grievances = await prisma.grievance.findMany({
    select: {
      id: true,
      category: true,
      departmentAssigned: true,
      status: true,
      createdAt: true,
    },
  });

  // Calculate patterns
  const categoryCount = grievances.reduce(
    (acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const departmentCount = grievances.reduce(
    (acc, g) => {
      if (g.departmentAssigned) {
        acc[g.departmentAssigned] = (acc[g.departmentAssigned] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Get recurring categories (top 5)
  const topCategories = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Get departments with most complaints
  const topDepartments = Object.entries(departmentCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name: name || "Unassigned", value }));

  // Identify hotspots (categories with highest unresolved count)
  const unresolvedByCategory = grievances
    .filter((g) => !["Resolved", "Closed"].includes(g.status))
    .reduce(
      (acc, g) => {
        acc[g.category] = (acc[g.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

  const hotspots = Object.entries(unresolvedByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar
        items={[
          { href: "/admin", label: "All Grievances" },
          { href: "/analytics", label: "Analytics" },
          { href: "/patterns", label: "Patterns" },
          { href: "/ai-settings", label: "AI Settings" },
        ]}
      />
      <section className="flex-1 px-6 pb-24 pt-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-8">
          <div>
            <BackButton href="/admin" label="Back to admin dashboard" className="ml-12 lg:-ml-1" />
            <h1 className="mt-6 text-3xl font-semibold text-foreground">Grievance Pattern Analysis</h1>
            <p className="mt-2 text-sm text-muted-foreground">Identify recurring issues, institutional pain points, and department-specific patterns for proactive resolution.</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="clean-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Grievances</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{grievances.length}</p>
            </div>
            <div className="clean-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Recurring Categories</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{topCategories.length}</p>
            </div>
            <div className="clean-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Active Hotspots</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{hotspots.length}</p>
            </div>
            <div className="clean-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Departments</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">{Object.keys(departmentCount).length}</p>
            </div>
          </div>

          {/* Top Categories */}
          <PatternChart data={topCategories} title="Top Complaint Categories" description="Most frequently reported issue types across the institution." />

          {/* Department Distribution and Hotspots */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="clean-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Department Complaint Load</h2>
              <p className="mt-1 text-sm text-muted-foreground">Which departments receive the most grievances?</p>
              <div className="mt-6 space-y-3">
                {topDepartments.map((dept) => (
                  <div key={dept.name} className="flex items-center justify-between rounded-lg border border-border/30 bg-background/30 p-3">
                    <span className="text-sm font-medium text-foreground">{dept.name}</span>
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-32 rounded-full bg-border">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${(dept.value / Math.max(...topDepartments.map((d) => d.value), 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground">{dept.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="clean-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Current Hotspots</h2>
              <p className="mt-1 text-sm text-muted-foreground">Unresolved issues requiring immediate attention.</p>
              <div className="mt-6 space-y-3">
                {hotspots.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active hotspots detected. System is operating smoothly!</p>
                ) : (
                  hotspots.map((hotspot) => (
                    <div key={hotspot.category} className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{hotspot.category}</span>
                        <span className="rounded-full bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-400">{hotspot.count} open</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Items */}
          <div className="clean-card p-6">
            <h2 className="text-lg font-semibold text-foreground">Recommendations</h2>
            <p className="mt-1 text-sm text-muted-foreground">Based on pattern analysis, consider these actions:</p>
            <div className="mt-6 space-y-3">
              {topCategories.length > 0 && (
                <div className="flex gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4">
                  <div className="text-lg">💡</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Policy Review</p>
                    <p className="mt-1 text-xs text-muted-foreground">Review institutional policies related to <strong>{topCategories[0].name}</strong> - the most frequent complaint category.</p>
                  </div>
                </div>
              )}
              {hotspots.length > 0 && (
                <div className="flex gap-3 rounded-lg border border-orange-500/30 bg-orange-500/5 p-4">
                  <div className="text-lg">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Urgent Resolution</p>
                    <p className="mt-1 text-xs text-muted-foreground">Address <strong>{hotspots[0].category}</strong> complaints urgently to prevent escalation. {hotspots[0].count} cases remain unresolved.</p>
                  </div>
                </div>
              )}
              {topDepartments.length > 0 && (
                <div className="flex gap-3 rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                  <div className="text-lg">🎯</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Resource Allocation</p>
                    <p className="mt-1 text-xs text-muted-foreground">Consider allocating more resolution resources to <strong>{topDepartments[0].name}</strong> to manage complaint volume.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Link to Full Analytics */}
          <div className="flex justify-center">
            <Link href="/analytics" className="rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/20">
              View Full Analytics Dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
