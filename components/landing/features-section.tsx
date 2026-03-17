"use client";

import { SectionWrapper } from "./section-wrapper";
import {
  Sparkles,
  GitBranch,
  Activity,
  TrendingUp,
  Shield,
  BarChart,
  StarHalf,
  MessageSquareText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const features: { icon: LucideIcon; title: string; description: string; num: string }[] = [
  {
    icon: Sparkles,
    num: "/ 01",
    title: "Smart Complaint Categorization",
    description:
      "Uses NLP to automatically understand and categorize grievances for faster resolution.",
  },
  {
    icon: GitBranch,
    num: "/ 02",
    title: "Automatic Department Routing",
    description:
      "AI assigns complaints directly to the relevant department \u2014 no manual intervention needed.",
  },
  {
    icon: Activity,
    num: "/ 03",
    title: "Real-Time Tracking",
    description:
      "Students can track grievance status with live updates at every stage of resolution.",
  },
  {
    icon: TrendingUp,
    num: "/ 04",
    title: "Pattern Detection",
    description:
      "Identifies recurring issues across departments to help the institution take preventive action.",
  },
  {
    icon: StarHalf,
    num: "/ 05",
    title: "Feedback & Rating System",
    description:
      "After a complaint is resolved, students can rate the resolution process and provide feedback on service quality.",
  },
  {
    icon: MessageSquareText,
    num: "/ 06",
    title: "AI Complaint Assistant",
    description:
      "An intelligent chatbot that helps students draft, refine, and submit complaints with guided prompts and smart suggestions.",
  },
  {
    icon: BarChart,
    num: "/ 07",
    title: "Data-Driven Insights",
    description:
      "Comprehensive analytics dashboard for administrators to monitor resolution times and department performance.",
  },
];

import { useRef, useState } from "react";

const FeatureCard = ({ f }: { f: { icon: LucideIcon; title: string; description: string; num: string } }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className="relative bg-card p-8 transition-colors group overflow-hidden border-border"
    >
      {/* Glare effect */}
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
      
      <div className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">
        <div className="flex items-center justify-between mb-6">
          <f.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors duration-500" />
          <span className="text-xs font-medium text-muted-foreground tracking-wider group-hover:text-foreground transition-colors duration-500">{f.num}</span>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2 transition-colors duration-500">{f.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors duration-500">{f.description}</p>
      </div>
    </div>
  );
};

export const FeaturesSection = () => (
  <SectionWrapper id="features">
    <div className="mb-16">
      <div className="section-label mb-6">Features</div>
      <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
        Students Don&apos;t Need Another Portal.{" "}
        <span className="text-muted-foreground">They Need a System That Works.</span>
      </h2>
    </div>

    <div className="grid gap-px bg-white/5 md:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-white/10">
      {features.map((f) => (
        <FeatureCard key={f.title} f={f} />
      ))}
    </div>
  </SectionWrapper>
);
