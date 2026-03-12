"use client";

import { SectionWrapper } from "./section-wrapper";
import {
  GraduationCap,
  FileCheck,
  Home,
  BookOpen,
  Monitor,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const departments: { icon: LucideIcon; name: string; desc: string }[] = [
  { icon: GraduationCap, name: "Academic Department", desc: "Curriculum, faculty, and classroom issues" },
  { icon: FileCheck, name: "Examination Cell", desc: "Exam scheduling, results, and evaluation" },
  { icon: Home, name: "Hostel Management", desc: "Accommodation, facilities, and maintenance" },
  { icon: BookOpen, name: "Library", desc: "Resources, access, and library services" },
  { icon: Monitor, name: "IT Support", desc: "Network, systems, and technical issues" },
  { icon: Settings, name: "Administration", desc: "General administration and student services" },
];

export const DepartmentsSection = () => (
  <SectionWrapper id="departments">
    <div className="mb-16">
      <div className="section-label mb-6">Routing</div>
      <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
        AI routes complaints to{" "}
        <span className="text-muted-foreground">the right department automatically.</span>
      </h2>
    </div>

    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {departments.map((d) => (
        <div
          key={d.name}
          className="clean-card flex items-center gap-4 p-6 group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border">
            <d.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{d.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{d.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);
