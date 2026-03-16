"use client";

import { useRef, useState } from "react";
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

const TiltCard = ({ r }: { r: { icon: LucideIcon; title: string; features: string[] } }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse position relative to card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Calculate rotation (-5 to 5 degrees)
    const rotateY = ((mouseX / width) - 0.5) * 10;
    const rotateX = ((mouseY / height) - 0.5) * -10;
    
    setRotate({ x: rotateX, y: rotateY });
    
    // Calculate glare position
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.15,
    });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setGlare({ ...glare, opacity: 0 });
  };

  return (
    <div className="perspective-[1000px] h-full">
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-full relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 ease-out hover:border-foreground/20"
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Glare effect */}
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 dark:mix-blend-lighten mix-blend-darken"
          style={{
            opacity: glare.opacity,
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, var(--glare-color), rgba(0,0,0,0) 40%)`,
            zIndex: 10,
          }}
        />

        {/* Content - pushed out slightly for 3D effect */}
        <div style={{ transform: "translateZ(30px)" }}>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-background border border-border transition-colors group-hover:border-foreground/20">
              <r.icon className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-0">{r.title}</h3>
          </div>
          
          <ul className="space-y-4">
            {r.features.map((f, i) => (
              <li 
                key={f} 
                className="flex items-start gap-3 text-sm text-muted-foreground"
                style={{ transform: `translateZ(${10 + (i * 5)}px)` }}
              >
                <div className="h-1.5 w-1.5 rounded-full bg-foreground/20 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export const RolesSection = () => (
  <SectionWrapper id="roles">
    <div className="mb-16">
      <div className="section-label mb-6">Access Control</div>
      <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
        For every stakeholder{" "}
        <span className="text-muted-foreground">in the resolution process.</span>
      </h2>
    </div>

    <div className="grid gap-6 md:grid-cols-3">
      {roles.map((r) => (
        <TiltCard key={r.title} r={r} />
      ))}
    </div>
  </SectionWrapper>
);
