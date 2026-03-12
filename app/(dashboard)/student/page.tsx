import Link from "next/link";
import { FileText, MessageSquare, Search } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatGrievanceStatus, getDashboardPathForRole } from "@/lib/utils";

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

  const total = grievances.length;
  const resolved = grievances.filter((grievance) => grievance.status === "Resolved" || grievance.status === "Closed").length;
  const open = total - resolved;
  const latestGrievance = grievances[0];

  const cards = [
    { href: "/submit-grievance", label: "Submit Grievance", desc: "File a new complaint", icon: FileText },
    { href: latestGrievance ? `/track/${latestGrievance.id}` : "/submit-grievance", label: "Track Status", desc: latestGrievance ? "Check your latest complaint progress" : "Track after your first submission", icon: Search },
    { href: latestGrievance ? `/chat?grievanceId=${latestGrievance.id}` : "/chat", label: "Chat with Department", desc: "Discuss your assigned case", icon: MessageSquare },
  ];

  return (
    <main className="min-h-[calc(100vh-6rem)] bg-background">
      <div className="mx-auto max-w-5xl space-y-8 px-6 pb-24 pt-12">
        <div>
          <div className="section-label mb-4">
            <span className="mr-2 h-1.5 w-1.5 rounded-full bg-foreground" />
            Dashboard
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Student Portal</h1>
          <p className="mt-2 text-sm text-muted-foreground">Manage your grievances and track resolutions.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.label} href={c.href} className="group clean-card p-6 flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors group-hover:border-foreground/20">
                <c.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </div>
              <h3 className="text-sm font-medium text-foreground">{c.label}</h3>
              <p className="text-xs text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Grievances</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{total}</p>
          </div>
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Open Cases</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{open}</p>
          </div>
          <div className="clean-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Resolved</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{resolved}</p>
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
      </div>
    </main>
  );
}
