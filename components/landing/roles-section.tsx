"use client";

import { SectionWrapper } from "./section-wrapper";
import { User, Briefcase, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const roles: { icon: LucideIcon; title: string; features: string[] }[] = [
  {
    icon: User,
    title: "Student",
    features: [
      "Submit grievance with details",
      "Track complaint in real time",
      "Receive resolution updates",
      "View complaint history",
    ],
  },
  {
    icon: Briefcase,
    title: "Department Staff",
    features: [
      "View assigned complaints",
      "Update resolution status",
      "Communicate with student",
      "Manage department queue",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Admin",
    features: [
      "Monitor all grievances",
      "Track department performance",
      "Analyze complaint patterns",
      "Generate institutional reports",
    ],
  },
];

export const RolesSection = () => (
  <SectionWrapper id="roles">
    <div className="mb-16">
      <div className="section-label mb-6">Access Control</div>
      <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
        For every stakeholder{" "}
        <span className="text-muted-foreground">in the resolution process.</span>
      </h2>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {roles.map((r) => (
        <div
          key={r.title}
          className="clean-card p-8 group"
        >
          <r.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors mb-6" />
          <h3 className="text-xl font-bold text-foreground mb-5">{r.title}</h3>
          <ul className="space-y-3">
            {r.features.map((f) => (
              <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </SectionWrapper>
);
