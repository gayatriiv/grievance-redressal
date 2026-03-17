"use client";

import Link from "next/link";
import { Sun, Moon, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { PillaiLogo } from "@/components/ui/pillai-logo";
import { useTheme } from "@/components/theme-provider";

export const Navbar = () => {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:border-foreground/20 relative overflow-hidden"
            aria-label="Toggle theme"
          >
            {mounted ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme === "dark" ? "dark" : "light"}
                  initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className="absolute"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Moon className="h-4 w-4 text-muted-foreground" />
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <span className="h-4 w-4" />
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
                onClick={async () => {
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("appSignOut", "1");
                  }
                  const result = await signOut({ redirect: false, callbackUrl: "/" });
                  if (typeof result?.url === "string") {
                    router.push(result.url);
                  } else {
                    router.push("/");
                  }
                }}
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
