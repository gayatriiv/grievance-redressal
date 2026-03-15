"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { GrievanceForm } from "@/components/forms/grievance-form";
import { BackButton } from "@/components/ui/back-button";

export default function SubmitGrievancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = session?.user as { name?: string | null; role?: string | null; department?: string | null; rollNumber?: string | null } | undefined;

  useEffect(() => {
    if (status === "unauthenticated") {
      const signOutFlag = typeof window !== "undefined" ? window.localStorage.getItem("appSignOut") : null;
      if (signOutFlag) {
        window.localStorage.removeItem("appSignOut");
        return;
      }
      router.push("/login?callbackUrl=/submit-grievance");
    }

    if (status === "authenticated" && user?.role && user.role !== "student") {
      router.push(user.role === "admin" ? "/admin" : "/department");
    }
  }, [status, router, user?.role]);

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated" || user?.role === "admin" || user?.role === "department") return null;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-background pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="relative z-10 mx-auto max-w-2xl px-6 sm:px-8 py-12 sm:py-16 space-y-8">
          <BackButton href={user?.role === "student" ? "/student" : "/"} label="Back to dashboard" className="mt-0" />
          <div className="space-y-6">
            <div className="section-label">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-foreground" />
              New Complaint
            </div>
            <h1 className="text-3xl font-bold tracking-tight leading-tight text-foreground md:text-4xl">Submit a Grievance</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Fill in the details below. AI will automatically categorize and route your complaint.</p>
          </div>
          <GrievanceForm defaults={{ name: user?.name, department: user?.department, rollNumber: user?.rollNumber }} />
        </div>
      </main>
    </>
  );
}

