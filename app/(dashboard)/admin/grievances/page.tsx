import Link from "next/link";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatGrievanceStatus, getDashboardPathForRole } from "@/lib/utils";
import { adminSidebarItems } from "@/lib/navigation";

export default async function AdminGrievancesPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login?callbackUrl=/admin/grievances");
  if (sessionUser.role !== "admin") redirect(getDashboardPathForRole(sessionUser.role));

  const grievances = await prisma.grievance.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      urgency: true,
      status: true,
      departmentAssigned: true,
      updatedAt: true,
      isAnonymous: true,
      student: { select: { name: true, department: true } },
      votes: { select: { value: true } },
      follows: { select: { id: true } },
      comments: { select: { id: true } },
    },
  });

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={[...adminSidebarItems]} />
      <section className="flex-1 px-6 pb-10 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6 pt-3">
          <BackButton href="/admin" label="Back to overview" className="ml-12 lg:-ml-1" />

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Admin</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">All grievances</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Browse and track every grievance in the system.
              </p>
            </div>
          </div>

          <div className="clean-card p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-3 py-2">Title</th>
                    <th className="px-3 py-2">Student</th>
                    <th className="px-3 py-2">Assigned</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Urgency</th>
                    <th className="px-3 py-2">Signals</th>
                    <th className="px-3 py-2">Updated</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {grievances.length === 0 ? (
                    <tr>
                      <td className="px-3 py-4 text-sm text-muted-foreground" colSpan={8}>
                        No grievances found.
                      </td>
                    </tr>
                  ) : (
                    grievances.map((g) => {
                      const support =
                        g.votes.filter((v) => v.value > 0).length - g.votes.filter((v) => v.value < 0).length;
                      return (
                        <tr key={g.id} className="rounded-2xl border border-border bg-background/40">
                          <td className="px-3 py-3">
                            <p className="max-w-[34rem] truncate text-sm font-medium text-foreground">{g.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              {g.category} · #{g.id.slice(-6).toUpperCase()}
                            </p>
                          </td>
                          <td className="px-3 py-3 text-sm text-muted-foreground">
                            {g.isAnonymous ? "Anonymous" : g.student.name}
                            <div className="mt-1 text-xs text-muted-foreground">
                              {g.isAnonymous ? "Unknown Department" : (g.student.department || "Unknown Department")}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-muted-foreground">{g.departmentAssigned}</td>
                          <td className="px-3 py-3 text-sm text-foreground">{formatGrievanceStatus(g.status)}</td>
                          <td className="px-3 py-3 text-sm text-muted-foreground">{g.urgency}</td>
                          <td className="px-3 py-3 text-xs text-muted-foreground">
                            {support} support · {g.follows.length} following · {g.comments.length} comments
                          </td>
                          <td className="px-3 py-3 text-sm text-muted-foreground">
                            {new Date(g.updatedAt).toLocaleString()}
                          </td>
                          <td className="px-3 py-3">
                            <Link
                              href={`/track/${g.id}`}
                              className="inline-flex rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90"
                            >
                              Track
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

