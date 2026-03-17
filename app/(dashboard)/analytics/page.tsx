import { redirect } from "next/navigation";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Sidebar } from "@/components/layout/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";
import { adminSidebarItems } from "@/lib/navigation";

export default async function AnalyticsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/analytics");
  }

  if (sessionUser.role !== "admin") {
    redirect(getDashboardPathForRole(sessionUser.role));
  }

  return (
    <main className="flex min-h-[calc(100vh-6rem)] bg-background">
      <Sidebar items={[...adminSidebarItems]} />
      <section className="flex-1 px-6 pb-10 lg:px-10">
        <div className="mx-auto max-w-7xl space-y-6 pt-3">
          <BackButton href="/admin" label="Back to admin dashboard" className="ml-12 lg:-ml-1" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Analytics Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Visualize submission trends, resolution performance, and department workloads.
            </p>
          </div>
          <div className="clean-card p-6">
            <AnalyticsCharts />
          </div>
        </div>
      </section>
    </main>
  );
}