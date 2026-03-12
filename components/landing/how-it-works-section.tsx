"use client";

import { SectionWrapper } from "./section-wrapper";

const steps = [
  {
    number: "01",
    title: "Submit Grievance",
    description: "Student fills out a simple form describing the complaint with relevant details.",
  },
  {
    number: "02",
    title: "AI Analyzes Complaint",
    description: "NLP engine processes the text, identifies the category and urgency of the issue.",
  },
  {
    number: "03",
    title: "Department Assignment",
    description: "System automatically routes the complaint to the correct department for resolution.",
  },
  {
    number: "04",
    title: "Department Resolves",
    description: "Assigned department reviews and works on resolving the grievance efficiently.",
  },
  {
    number: "05",
    title: "Student Notified",
    description: "Student tracks progress in real time and receives notifications on resolution.",
  },
];

export const HowItWorksSection = () => (
  <SectionWrapper id="how-it-works">
    <div className="mb-16">
      <div className="section-label mb-6">Process</div>
      <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
        From submission to resolution.{" "}
        <span className="text-muted-foreground">Streamlined by AI.</span>
      </h2>
    </div>

    <div className="space-y-0 border-t border-border">
      {steps.map((s) => (
        <div
          key={s.number}
          className="group flex items-start gap-6 border-b border-border py-8 transition-colors hover:bg-card/50 px-4 -mx-4 rounded-lg"
        >
          <span className="text-3xl font-extrabold text-muted-foreground/30 tabular-nums leading-none pt-1 min-w-[3rem]">
            {s.number}
          </span>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-1">{s.title}</h3>
            <p className="text-sm text-muted-foreground max-w-lg">{s.description}</p>
          </div>
        </div>
      ))}
    </div>
  </SectionWrapper>
);
