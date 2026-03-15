import { redirect } from "next/navigation";
import { GrievanceChat } from "@/components/dashboard/grievance-chat";
import { Sidebar } from "@/components/layout/sidebar";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole, normalizeDepartmentName } from "@/lib/utils";

export default async function DepartmentChatPage({ searchParams }: { searchParams?: { grievanceId?: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/department/chat");
  }

  if (sessionUser.role !== "department") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  const department = normalizeDepartmentName(sessionUser.department);
  const grievances = department
    ? await prisma.grievance.findMany({
        where: { departmentAssigned: department },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          category: true,
          status: true,
          departmentAssigned: true,
          updatedAt: true,
          student: { select: { name: true } },
        },
      })
    : [];

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={[{ href: "/department", label: "Assigned Cases" }, { href: "/department/chat", label: "Student Chat" }]} />
      <section className="flex-1 space-y-6 px-8 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Department Conversations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Update case status, answer students, and keep the grievance trail current.</p>
        </div>

        <GrievanceChat
          grievances={grievances.map((grievance) => ({
            id: grievance.id,
            title: grievance.title,
            category: grievance.category,
            status: grievance.status,
            departmentAssigned: grievance.departmentAssigned,
            updatedAt: grievance.updatedAt.toISOString(),
            studentName: grievance.student.name,
          }))}
          role="department"
          defaultGrievanceId={searchParams?.grievanceId}
          emptyMessage="No grievances are assigned to your department right now. New academic and faculty-related grievances for your department will appear here automatically."
        />
      </section>
    </main>
  );
}
