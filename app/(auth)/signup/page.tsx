"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

const detectEmailKind = (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  if (normalizedEmail.endsWith("@student.mes.ac.in")) return "student";
  if (normalizedEmail.endsWith("@mes.ac.in")) return "staff";
  return "invalid";
};

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const emailKind = detectEmailKind(email);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      department: fd.get("department") as string || undefined,
      rollNumber: fd.get("rollNumber") as string || undefined,
    };

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Something went wrong");
        setLoading(false);
        return;
      }
      const loginUrl = `/login?registered=true${
        callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
      }`;
      router.push(loginUrl);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-foreground/20";

  return (
    <main className="relative min-h-screen bg-background px-6 py-16">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="grid min-h-screen place-items-center">

      <div className="relative z-10 w-full max-w-xl space-y-8 rounded-2xl border border-border bg-card p-10">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Get Started</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Use your MES college email. Student accounts are detected from <span className="font-medium text-foreground">@student.mes.ac.in</span>; faculty and approved admins use <span className="font-medium text-foreground">@mes.ac.in</span>.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
            <input id="name" name="name" type="text" required className={inputClass} placeholder="Full name" />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
            <input id="email" name="email" type="email" required className={inputClass} placeholder="you@student.mes.ac.in" value={email} onChange={(e) => setEmail(e.target.value)} />
            <p className="text-xs text-muted-foreground">
              {emailKind === "student" && "Student account detected. Your dashboard will open after login."}
              {emailKind === "staff" && "Faculty or admin account detected. Approved admin emails keep admin access; other staff accounts open the department dashboard."}
              {emailKind === "invalid" && "Enter a valid MES college email address to continue."}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
            <input id="password" name="password" type="password" required minLength={6} className={inputClass} placeholder="Min 6 characters" />
          </div>

          {emailKind === "student" && (
            <div className="space-y-1.5">
              <label htmlFor="rollNumber" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Roll Number</label>
              <input id="rollNumber" name="rollNumber" type="text" className={inputClass} placeholder="e.g. 616" />
            </div>
          )}

          {emailKind === "staff" && (
            <div className="space-y-1.5">
              <label htmlFor="department" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</label>
              <input id="department" name="department" type="text" className={inputClass} placeholder="e.g. Computer Engineering" required />
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-foreground py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground underline underline-offset-4 hover:opacity-80">
              Login
            </Link>
          </p>
        </div>
      </div>
      </div>
    </main>
  );
}
