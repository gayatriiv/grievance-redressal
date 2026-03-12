"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = { href: string; label: string };

export const Sidebar = ({ items }: { items: SidebarItem[] }) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed left-4 top-[6.75rem] z-40 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/85 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:border-foreground/20 lg:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-4 w-4" />
      </button>

      <motion.aside
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="sticky top-24 hidden h-[calc(100vh-6rem)] w-64 border-r border-border bg-card p-6 lg:block"
      >
        <div className="space-y-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-lg px-4 py-2.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
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
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-card px-5 pb-6 pt-24 shadow-2xl lg:hidden"
            >
              <div className="mb-5 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
                  aria-label="Close sidebar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-lg px-4 py-2.5 text-sm transition-colors",
                      pathname === item.href
                        ? "bg-background text-foreground"
                        : "text-muted-foreground hover:bg-background hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
