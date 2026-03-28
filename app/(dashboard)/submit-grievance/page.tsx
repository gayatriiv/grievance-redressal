import { redirect } from "next/navigation";
import { GrievanceForm } from "@/components/forms/grievance-form";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, User, ListChecks, FileText, MessageSquare, Users } from "lucide-react";

export default async function SubmitGrievancePage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/submit-grievance");
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

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={sidebarItems} workspaceTitle="Student Portal" />
      <section className="flex-1 space-y-8 px-6 pb-24 pt-3 lg:px-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Submit a Grievance</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Share your concern with the institute. Your grievance will be routed to the right department and you can
            track the resolution at every step.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr),minmax(0,1fr)]">
          <div className="clean-card p-6 lg:p-8">
            <GrievanceForm
              defaults={{
                name: sessionUser.name,
                department: sessionUser.department,
                rollNumber: sessionUser.rollNumber,
              }}
            />
          </div>

          <aside className="space-y-4">
            <div className="clean-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">What happens after you submit</p>
              <ol className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>1. Your grievance is logged and time-stamped.</li>
                <li>2. The system routes it to the relevant department.</li>
                <li>3. You can track status from the Track Grievances page.</li>
                <li>4. Departments can reply and ask for more details via Chat.</li>
              </ol>
            </div>
            <div className="clean-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Tips for a clear grievance</p>
              <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
                <li>• Add specific dates, locations, and people involved where relevant.</li>
                <li>• Focus on facts and desired outcome.</li>
                <li>• Attach supporting documents or screenshots if helpful.</li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

