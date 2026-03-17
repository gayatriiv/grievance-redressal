"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, BarChart3, Sparkles, Users, Shield, Menu, X, ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = { href: string; label: string; icon?: React.ReactNode };

const iconFor = (href: string) => {
  if (href === "/admin") return <LayoutDashboard className="h-4 w-4" />;
  if (href === "/admin/grievances") return <ListChecks className="h-4 w-4" />;
  if (href === "/analytics") return <BarChart3 className="h-4 w-4" />;
  if (href === "/patterns") return <Sparkles className="h-4 w-4" />;
  if (href === "/ai-settings") return <Shield className="h-4 w-4" />;
  if (href === "/users") return <Users className="h-4 w-4" />;
  return <LayoutDashboard className="h-4 w-4" />;
};

export const Sidebar = ({ items }: { items: SidebarItem[] }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem("sidebarCollapsed") : null;
    setCollapsed(stored === "1");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-[6.75rem] z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-foreground/20 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={cn(
          "sticky top-24 hidden h-[calc(100vh-6rem)] border-r border-border bg-card/60 backdrop-blur lg:block",
          collapsed ? "w-24 px-4 py-6" : "w-72 p-6"
        )}
      >
        <div className={cn("mb-6 flex items-start justify-between gap-3", collapsed && "justify-center")}>
          {!collapsed && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
              <p className="mt-1 text-lg font-semibold text-foreground">Admin Console</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <div className="space-y-1.5">
          {items.map((item) => (
            <SidebarLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon ?? iconFor(item.href)}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </div>
      </motion.aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar overlay"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />

            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="fixed inset-y-0 left-0 z-50 w-80 border-r border-border bg-card/80 px-5 pb-6 pt-24 shadow-2xl backdrop-blur lg:hidden"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</p>
                  <p className="mt-1 text-base font-semibold text-foreground">Admin Console</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                {items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon ?? iconFor(item.href)}
                    active={pathname === item.href}
                    collapsed={false}
                  />
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const SidebarLink = ({
  href,
  label,
  icon,
  active,
  collapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  collapsed: boolean;
}) => {
  return (
            <Link
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
        collapsed && "justify-center px-3",
                active
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
      title={collapsed ? label : undefined}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background/40 text-muted-foreground transition-colors group-hover:text-foreground",
                  active && "text-foreground"
                )}
              >
                {icon}
              </span>
      {!collapsed && <span className="flex-1">{label}</span>}
            </Link>
  );
};
