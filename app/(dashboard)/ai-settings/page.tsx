import { redirect } from "next/navigation";
import { AISettingsForm } from "@/components/dashboard/ai-settings-form";
import { Sidebar } from "@/components/layout/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";

export default async function AISettingsPage() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    redirect("/login?callbackUrl=/ai-settings");
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
        <div className="mx-auto max-w-2xl">
          <BackButton href="/admin" label="Back to admin dashboard" className="ml-12 lg:-ml-1" />
          <h1 className="mb-6 mt-6 text-3xl font-semibold">AI Settings</h1>
          <p className="mb-6 text-sm text-muted-foreground">Groq powers complaint categorization, department assignment support, and recurring issue analysis. The environment key is used automatically when present; this form stores an encrypted fallback key in the database.</p>
          <AISettingsForm />
        </div>
      </section>
    </main>
  );
}