"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
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

export const HowItWorksSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <SectionWrapper id="how-it-works">
      <div className="mb-20 flex flex-col md:items-center md:text-center">
        <div className="section-label mb-6">Process</div>
        <h2 className="text-3xl font-extrabold text-foreground md:text-4xl lg:text-5xl max-w-3xl">
          From submission to resolution.{" "}
          <span className="text-muted-foreground block mt-2">Streamlined by AI.</span>
        </h2>
      </div>

      <div ref={containerRef} className="relative max-w-4xl mx-auto py-10">
        {/* Static Background Line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-border md:-translate-x-1/2" />
        
        {/* Animated Progress Line */}
        <motion.div 
          className="absolute left-8 md:left-1/2 top-0 w-[2px] bg-foreground md:-translate-x-1/2 origin-top z-0"
          style={{ height: lineHeight }}
        />

        <div className="space-y-16 md:space-y-24 relative z-10">
          {steps.map((s, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative flex flex-col md:flex-row items-start md:items-center ${
                  isEven ? "md:flex-row-reverse" : ""
                } gap-8 md:gap-0`}
              >
                {/* Center Node */}
                <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex h-14 w-14 items-center justify-center rounded-full border-[4px] border-background bg-card text-foreground font-bold shadow-md ring-1 ring-border mt-0 z-10">
                  {s.number}
                </div>

                {/* Content Card */}
                <div className={`ml-20 md:ml-0 md:w-1/2 ${isEven ? "md:text-left" : "md:text-right"}`}>
                  <div className={`bg-background hover:bg-card/50 p-8 rounded-3xl border border-border transition-all duration-300 hover:border-foreground/30 hover:shadow-xl ${
                    isEven ? "md:ml-12 lg:ml-20" : "md:mr-12 lg:mr-20"
                  }`}>
                    <h3 className="text-2xl font-bold text-foreground mb-4">{s.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg">{s.description}</p>
                  </div>
                </div>
                
                {/* Empty div for layout balance on desktop */}
                <div className="hidden md:block md:w-1/2" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </SectionWrapper>
  );
};
