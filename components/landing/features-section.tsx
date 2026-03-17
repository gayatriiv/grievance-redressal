"use client";

import { SectionWrapper } from "./section-wrapper";
import {
  Sparkles,
  GitBranch,
  Activity,
  TrendingUp,
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
];

export const FeaturesSection = () => (
  <SectionWrapper id="features">
    <div className="mb-16">
      <div className="section-label mb-6">Features</div>
      <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
        Students Don&apos;t Need Another Portal.{" "}
        <span className="text-muted-foreground">They Need a System That Works.</span>
      </h2>
    </div>

    <div className="grid gap-px bg-border md:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-border">
      {features.map((f) => (
        <div
          key={f.title}
          className="bg-background p-8 transition-colors hover:bg-card group"
        >
          <div className="flex items-center justify-between mb-6">
            <f.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
            <span className="text-xs font-medium text-muted-foreground tracking-wider">{f.num}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
        </div>
      ))}
    </div>
  </SectionWrapper>
);
