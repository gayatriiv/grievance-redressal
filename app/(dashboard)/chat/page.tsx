import { redirect } from "next/navigation";
import { GrievanceChat } from "@/components/dashboard/grievance-chat";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, User, ListChecks, FileText, MessageSquare, Users } from "lucide-react";

export default async function StudentChatPage({ searchParams }: { searchParams?: { grievanceId?: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/chat");
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
      category: true,
      status: true,
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
      <section className="flex-1 space-y-6 px-6 pb-24 pt-3 lg:px-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Chat with Assigned Department</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ask for updates, share additional context, and keep a transparent record of the resolution process.
          </p>
        </div>
        <GrievanceChat
          grievances={grievances.map((grievance) => ({ ...grievance, updatedAt: grievance.updatedAt.toISOString() }))}
          role="student"
          defaultGrievanceId={searchParams?.grievanceId}
          emptyMessage="No grievances have been filed yet. Submit a grievance first to start a conversation with the assigned department."
        />
      </section>
    </main>
  );
}
