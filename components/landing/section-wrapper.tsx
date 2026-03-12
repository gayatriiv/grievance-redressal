"use client";

import { useEffect, useRef, ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  id?: string;
  className?: string;
}

export const SectionWrapper = ({ children, id, className = "" }: SectionWrapperProps) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) el.classList.add("visible");
      },
      { threshold: 0.08 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={`section-fade relative py-24 md:py-32 bg-background ${className}`}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-12">{children}</div>
    </section>
  );
};
