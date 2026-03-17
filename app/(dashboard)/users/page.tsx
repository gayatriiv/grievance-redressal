import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";
import { UsersAdminPanel } from "@/components/dashboard/users-admin-panel";

export default async function UsersAdminPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) redirect("/login?callbackUrl=/users");
  if (sessionUser.role !== "admin") redirect(getDashboardPathForRole(sessionUser.role));

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar
        items={[
          { href: "/admin", label: "All Grievances" },
          { href: "/analytics", label: "Analytics" },
          { href: "/patterns", label: "Patterns" },
          { href: "/ai-settings", label: "AI Settings" },
          { href: "/users", label: "Users" },
        ]}
      />
      <section className="flex-1 px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6 pt-3">
          <BackButton href="/admin" label="Back to admin dashboard" className="ml-12 lg:-ml-1" />
          <div>
            <h1 className="mt-6 text-3xl font-semibold text-foreground">User Management</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Add admins, department users, and students. Google OAuth redirects based on the user role stored in DB.
            </p>
          </div>
          <UsersAdminPanel />
        </div>
      </section>
    </main>
  );
}

