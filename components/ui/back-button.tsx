"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

type BackButtonProps = {
  href: string;
  label: string;
  className?: string;
};

export const BackButton = ({ href, label, className }: BackButtonProps) => {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (window.history.length > 1) {
          router.back();
          return;
        }

        router.push(href);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </button>
  );
};
