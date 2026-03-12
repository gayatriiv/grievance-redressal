import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">{children}</div>
    </div>
  );
}