"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Chrome } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const rawCallbackUrl = searchParams.get("callbackUrl") || "";
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

    const effectiveCallback =
      !rawCallbackUrl ||
      rawCallbackUrl === "/" ||
      rawCallbackUrl === window.location.origin
        ? "/post-auth"
        : rawCallbackUrl;

    if (effectiveCallback) {
      router.push(effectiveCallback);
    } else if (role === "admin") {
      router.push("/admin");
    } else if (role === "department") {
      router.push("/department");
    } else {
      router.push("/student");
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const effectiveCallback =
        !rawCallbackUrl ||
        rawCallbackUrl === "/" ||
        rawCallbackUrl === window.location.origin
          ? "/post-auth"
          : rawCallbackUrl;

      await signIn("google", { callbackUrl: effectiveCallback });
    } catch {
      setError("Google sign-in failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 outline-none transition-colors focus:border-foreground/20 focus:ring-2 focus:ring-foreground/10";

  return (
    <>
      {registered && (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
          <p className="font-medium text-emerald-200">Account created</p>
          <p className="mt-1 text-emerald-300/90">You can now sign in.</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <p className="font-medium text-red-200">Sign in failed</p>
          <p className="mt-1 text-red-300/90">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="group flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:border-foreground/20 hover:bg-card/40 disabled:opacity-50"
        >
          <Chrome className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          {googleLoading ? "Connecting to Google..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">or continue with email</span>
          <div className="h-px flex-1 bg-border" />
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Email
          </label>
          <input
            id="email"
            className={inputClass}
            placeholder="name@student.mes.ac.in"
            name="email"
            type="email"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Password
            </label>
            <span className="text-xs text-muted-foreground">
              Use Google if you don&apos;t have a password
            </span>
          </div>
          <input
            id="password"
            className={inputClass}
            placeholder="Enter your password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-foreground py-3 text-sm font-semibold text-background shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      <div className="border-t border-border pt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={
              rawCallbackUrl
                ? `/signup?callbackUrl=${encodeURIComponent(rawCallbackUrl)}`
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
      <div className="grid min-h-screen place-items-center pt-24 pb-12">

      <div className="relative z-10 w-full max-w-xl space-y-8 rounded-3xl border border-border bg-card/70 p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.6)] backdrop-blur md:p-10">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Welcome back</p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Only valid MES accounts can log in. Students use{" "}
            <span className="font-medium text-foreground">@student.mes.ac.in</span>; faculty and admins use{" "}
            <span className="font-medium text-foreground">@mes.ac.in</span>.
          </p>
        </div>

        <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      </div>
    </main>
  );
}
