"use client";

import { SectionWrapper } from "./section-wrapper";

const bars = [
  { label: "Academic Dept.", count: 142, pct: 85 },
  { label: "Examination Cell", count: 98, pct: 60 },
  { label: "IT Support", count: 76, pct: 45 },
  { label: "Library", count: 54, pct: 32 },
  { label: "Hostel", count: 38, pct: 22 },
];

const miniStats = [
  { value: "87%", label: "Resolved" },
  { value: "2.4d", label: "Avg. Time" },
  { value: "94%", label: "AI Accuracy" },
];

const capabilities = [
  "NLP Based Complaint Categorization",
  "Recurring Issue Detection",
  "Department Workload Analytics",
  "Resolution Time Tracking",
  "Institutional Transparency",
];

export const InsightsSection = () => (
  <SectionWrapper id="insights">
    <div className="grid gap-16 lg:grid-cols-2 items-center">
      {/* Left */}
      <div>
        <div className="section-label mb-6">Intelligence</div>
        <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl mb-6">
          AI-Driven{" "}
          <span className="text-muted-foreground">Institutional Insights</span>
        </h2>
        <p className="text-muted-foreground mb-10 max-w-lg text-sm leading-relaxed">
          Beyond resolving individual complaints, the system provides administrators with
          actionable insights to improve institutional processes and student satisfaction.
        </p>
        <div className="space-y-3">
          {capabilities.map((c) => (
            <div key={c} className="flex items-center gap-3">
              <span className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
              <span className="text-sm text-foreground">{c}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right - Dashboard preview */}
      <div className="clean-card p-6">
        <div className="mb-5 flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
          <span className="ml-3 text-xs text-muted-foreground">Admin Dashboard</span>
        </div>

        <div className="space-y-4">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>{b.label}</span>
                <span>{b.count}</span>
              </div>
              <div className="h-2 rounded-full bg-card overflow-hidden border border-border">
                <div
                  className="h-full rounded-full bg-foreground/20 transition-all duration-1000"
                  style={{ width: b.pct + "%" }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {miniStats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </SectionWrapper>
);
