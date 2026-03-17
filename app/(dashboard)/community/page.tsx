import { redirect } from "next/navigation";
import { CommunityBoard } from "@/components/dashboard/community-board";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, User, ListChecks, FileText, MessageSquare, Users } from "lucide-react";

export default async function CommunityPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/community");
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
      <section className="flex-1 space-y-6 px-6 pb-24 pt-3 lg:px-10">
        <CommunityBoard />
      </section>
    </main>
  );
}