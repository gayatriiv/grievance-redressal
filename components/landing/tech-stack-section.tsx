"use client";

import { SectionWrapper } from "./section-wrapper";

const stack = [
  { label: "Frontend", tech: "React / Next.js", iconPath: "M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" },
  { label: "Backend", tech: "Node.js / Express", iconPath: "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" },
  { label: "Database", tech: "MongoDB", iconPath: "M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" },
  { label: "AI Processing", tech: "Natural Language Processing", iconPath: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" },
  { label: "Security", tech: "Role Based Access Control", iconPath: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" },
  { label: "Deployment", tech: "Cloud Ready", iconPath: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" },
];

import { useRef, useState } from "react";

const TechCard = ({ s }: { s: { label: string; tech: string; iconPath: string } }) => {
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
      className="relative bg-card p-8 text-center group overflow-hidden border-border"
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
      
      <div className="relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
        <svg className="mx-auto h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors duration-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={s.iconPath} />
        </svg>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1 group-hover:text-foreground/80 transition-colors duration-500">{s.label}</p>
        <p className="text-sm font-semibold text-foreground group-hover:text-foreground transition-colors duration-500">{s.tech}</p>
      </div>
    </div>
  );
};

export const TechStackSection = () => (
  <SectionWrapper id="tech">
    <div className="mb-16">
      <div className="section-label mb-6">Built With</div>
      <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
        Technology behind{" "}
        <span className="text-muted-foreground">the system.</span>
      </h2>
    </div>

    <div className="grid gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-3 rounded-2xl overflow-hidden border border-white/10">
      {stack.map((s) => (
        <TechCard key={s.label} s={s} />
      ))}
    </div>
  </SectionWrapper>
);
