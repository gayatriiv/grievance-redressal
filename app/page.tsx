"use client";

import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { DepartmentsSection } from "@/components/landing/departments-section";
import { RolesSection } from "@/components/landing/roles-section";
import { InsightsSection } from "@/components/landing/insights-section";
import { TechStackSection } from "@/components/landing/tech-stack-section";
import { StatsSection } from "@/components/landing/stats-section";
import { ContactSection } from "@/components/landing/contact-section";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <DepartmentsSection />
      <RolesSection />
      <InsightsSection />
      <StatsSection />
      <TechStackSection />
      <ContactSection />
      <Footer />
    </main>
  );
}
