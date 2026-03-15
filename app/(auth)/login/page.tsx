"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const callbackUrl = searchParams.get("callbackUrl") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: fd.get("email") as string,
      password: fd.get("password") as string,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    const session = await fetch("/api/auth/session").then((r) => r.json());
    const role = session?.user?.role;

    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (role === "admin") {
      router.push("/admin");
    } else if (role === "department") {
      router.push("/department");
    } else {
      router.push("/student");
    }
  };

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-foreground/20";

  return (
    <>
      {registered && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">
          Account created! You can now sign in.
        </p>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <input id="email" className={inputClass} placeholder="you@pillai.edu" name="email" type="email" required />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Password
          </label>
          <input id="password" className={inputClass} placeholder="Enter your password" name="password" type="password" required />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-foreground py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={
              callbackUrl
                ? `/signup?callbackUrl=${encodeURIComponent(callbackUrl)}`
                : "/signup"
            }
            className="text-foreground underline underline-offset-4 hover:opacity-80"
          >
            Sign up
          </Link>
        </p>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main className="relative min-h-screen bg-background px-6">
      <Navbar />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-40" />
      <div className="grid min-h-screen place-items-center">

      <div className="relative z-10 w-full max-w-xl space-y-8 rounded-2xl border border-border bg-card p-10">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Welcome Back</p>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Sign In</h1>
          <p className="text-sm text-muted-foreground">Only valid MES college accounts can log in. Students use <span className="font-medium text-foreground">@student.mes.ac.in</span>; faculty and approved admins use <span className="font-medium text-foreground">@mes.ac.in</span>.</p>
        </div>

        <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      </div>
    </main>
  );
}
