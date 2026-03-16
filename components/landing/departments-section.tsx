"use client";

import { useRef, useState } from "react";
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

const DepartmentCard = ({ d }: { d: { icon: LucideIcon; name: string; desc: string } }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setMousePosition({ x, y });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative flex items-center gap-4 p-6 rounded-2xl border border-border bg-card overflow-hidden group transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
    >
      {/* Interactive hover spotlight */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 dark:mix-blend-lighten"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 255, 255, 0.08), transparent 40%)`,
        }}
      />
      <div
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-700 light:mix-blend-darken dark:hidden"
        style={{
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(0, 0, 0, 0.03), transparent 40%)`,
        }}
      />
      
      <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-background transition-all duration-500 group-hover:scale-110 group-hover:border-foreground/20 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
        <d.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors duration-500" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors duration-500">
          {d.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 transition-colors duration-500 group-hover:text-foreground/80">
          {d.desc}
        </p>
      </div>
    </div>
  );
};

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
        <DepartmentCard key={d.name} d={d} />
      ))}
    </div>
  </SectionWrapper>
);
