"use client";

import Link from "next/link";
import { Sun, Moon, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { PillaiLogo } from "@/components/ui/pillai-logo";
import { useTheme } from "@/components/theme-provider";

export const Navbar = () => {
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();

  const dashboardHref =
    session?.user && (session.user as any).role === "admin"
      ? "/admin"
      : session?.user && (session.user as any).role === "department"
        ? "/department"
        : "/student";

  return (
    <nav className="glass-nav fixed top-0 z-50 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-12">
        <div className="flex items-center">
          <Link href="/">
            <PillaiLogo />
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/20"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Moon className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {session?.user ? (
            <>
              <Link
                href={dashboardHref}
                className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/20"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/20"
                aria-label="Sign out"
              >
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-all hover:border-foreground/20"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-all hover:opacity-90"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
