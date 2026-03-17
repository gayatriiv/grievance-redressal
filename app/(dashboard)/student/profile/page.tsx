import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole, normalizeDepartmentName } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, User, ListChecks, FileText, MessageSquare, Users } from "lucide-react";

export default async function StudentProfilePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/student/profile");
  }

  if (sessionUser.role !== "student") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

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

  const normalizedDepartment = normalizeDepartmentName(sessionUser.department);

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={sidebarItems} workspaceTitle="Student Portal" />
      <section className="flex-1 space-y-8 px-6 pb-24 pt-3 lg:px-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Profile</h1>
          <p className="mt-2 text-sm text-muted-foreground">View your basic details used for grievance submissions.</p>
        </div>

        <div className="clean-card max-w-xl space-y-4 p-6">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Name</p>
            <p className="mt-1 text-sm font-medium text-foreground">{sessionUser.name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Roll Number</p>
            <p className="mt-1 text-sm font-medium text-foreground">{sessionUser.rollNumber || "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Department</p>
            <p className="mt-1 text-sm font-medium text-foreground">{normalizedDepartment || "Not provided"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Email</p>
            <p className="mt-1 text-sm font-medium text-foreground">{sessionUser.email}</p>
          </div>
        </div>
      </section>
    </main>
  );
}

