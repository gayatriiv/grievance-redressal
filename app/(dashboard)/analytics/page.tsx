import { redirect } from "next/navigation";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Sidebar } from "@/components/layout/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";

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
      <Sidebar
        items={[
          { href: "/admin", label: "All Grievances" },
          { href: "/analytics", label: "Analytics" },
          { href: "/patterns", label: "Patterns" },
          { href: "/ai-settings", label: "AI Settings" },
        ]}
      />
      <section className="flex-1 px-6 pb-24 pt-10 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <BackButton href="/admin" label="Back to admin dashboard" className="ml-12 lg:-ml-1" />
          <h1 className="text-3xl font-semibold">Analytics Dashboard</h1>
          <AnalyticsCharts />
        </div>
      </section>
    </main>
  );
}