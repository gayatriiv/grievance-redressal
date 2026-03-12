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
      <main className="relative min-h-screen bg-background">
        <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
        <div className="relative z-10 mx-auto max-w-2xl px-6 pt-32 pb-20">
          <BackButton href="/student" label="Back to dashboard" />
          <div className="mb-8">
            <div className="section-label mb-4">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-foreground" />
              New Complaint
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">Submit a Grievance</h1>
            <p className="mt-3 text-sm text-muted-foreground">Fill in the details below. AI will automatically categorize and route your complaint.</p>
          </div>
          <GrievanceForm defaults={{ name: user?.name, department: user?.department, rollNumber: user?.rollNumber }} />
        </div>
      </main>
    </>
  );
}

