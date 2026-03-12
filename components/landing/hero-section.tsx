"use client";

import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { BlurIn } from "@/components/ui/blur-in";
import { SplitText } from "@/components/ui/split-text";

export const HeroSection = () => (
  <section id="home" className="relative min-h-screen overflow-hidden bg-background">
    {/* Subtle dot grid */}
    <div className="absolute inset-0 grid-bg opacity-40" />

    <div className="relative z-10 mx-auto max-w-5xl px-6 pt-36 pb-24 lg:pt-48 lg:pb-36 text-center">
      <BlurIn>
        <div className="section-label mx-auto mb-8">
          <div className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span>Pillai College of Engineering</span>
        </div>
      </BlurIn>

      <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl lg:text-7xl lg:leading-[1.08]">
        <SplitText text="One smart platform for" className="block" />
        <span className="text-muted-foreground">
          <SplitText text="your entire grievance lifecycle" />
        </span>
      </h1>

      <BlurIn delay={0.4}>
        <p className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Submit complaints, track resolution in real-time, and let AI handle categorization
          and department routing &mdash; so nothing falls through the cracks.
        </p>
      </BlurIn>

      <BlurIn delay={0.6}>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/submit-grievance"
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-background transition-all hover:opacity-90"
          >
            Submit a Grievance
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="/track"
            className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:border-foreground/30"
          >
            <Search className="h-4 w-4" />
            Track Complaint
          </Link>
        </div>
      </BlurIn>

      {/* Mini feature cards row */}
      <BlurIn delay={0.8}>
        <div className="mt-20 grid grid-cols-2 gap-3 sm:grid-cols-4 max-w-3xl mx-auto">
          <MiniCard icon="sparkle" label="AI Classification" value="94% Accuracy" />
          <MiniCard icon="route" label="Auto Routing" value="6+ Departments" />
          <MiniCard icon="clock" label="Resolution" value="~2.4 Days Avg" />
          <MiniCard icon="check" label="Processed" value="1,200+ Cases" />
        </div>
      </BlurIn>
    </div>
  </section>
);

const MiniCard = ({ icon, label, value }: { icon: string; label: string; value: string }) => {
  const paths: Record<string, string> = {
    sparkle: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    route: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
    clock: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
    check: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  };

  return (
    <div className="clean-card p-4 text-left">
      <svg className="h-4 w-4 text-muted-foreground mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={paths[icon]} />
      </svg>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
    </div>
  );
};
