"use client";

const stats = [
  { value: "1,200+", label: "grievances processed" },
  { value: "2.4 days", label: "average resolution time" },
  { value: "6+", label: "departments connected" },
  { value: "94%", label: "AI categorization accuracy" },
  { value: "87%", label: "resolution rate" },
  { value: "24/7", label: "complaint submission" },
];

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="flex shrink-0 items-center gap-3 px-8">
    <span className="text-2xl font-extrabold text-foreground md:text-3xl">{value}</span>
    <span className="text-sm text-muted-foreground">{label}</span>
  </div>
);

const Separator = () => (
  <div className="flex shrink-0 items-center px-2">
    <div className="h-8 w-px bg-border" />
  </div>
);

export const StatsSection = () => (
  <section className="border-y border-border bg-background py-8 overflow-hidden">
    <div className="marquee-track">
      {/* Duplicate for seamless loop */}
      {[...stats, ...stats].map((s, i) => (
        <div key={i} className="flex items-center">
          <StatItem {...s} />
          <Separator />
        </div>
      ))}
    </div>
  </section>
);
