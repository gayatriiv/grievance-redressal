import { redirect } from "next/navigation";
import { AISettingsForm } from "@/components/dashboard/ai-settings-form";
import { Sidebar } from "@/components/layout/sidebar";
import { BackButton } from "@/components/ui/back-button";
import { getSessionUser } from "@/lib/session";
import { getDashboardPathForRole } from "@/lib/utils";
import { adminSidebarItems } from "@/lib/navigation";

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
      <Sidebar items={adminSidebarItems} />
      <section className="flex-1 px-6 pb-10 lg:px-10">
        <div className="mx-auto max-w-3xl pt-3 space-y-6">
          <BackButton href="/admin" label="Back to admin dashboard" className="ml-12 lg:-ml-1" />
          <div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">AI Settings</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Configure the provider and keys used for categorization, routing suggestions, and pattern analysis.
            </p>
          </div>
          <AISettingsForm />
        </div>
      </section>
    </main>
  );
}