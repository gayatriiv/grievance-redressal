import { Navbar } from "@/components/layout/navbar";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { Footer } from "@/components/landing/footer";

const HowItWorksSection = dynamic(
  () => import("@/components/landing/how-it-works-section").then((m) => m.HowItWorksSection),
  { ssr: false, loading: () => <div className="py-24 md:py-32" /> }
);
const DepartmentsSection = dynamic(
  () => import("@/components/landing/departments-section").then((m) => m.DepartmentsSection),
  { ssr: false, loading: () => <div className="py-24 md:py-32" /> }
);
const RolesSection = dynamic(
  () => import("@/components/landing/roles-section").then((m) => m.RolesSection),
  { ssr: false, loading: () => <div className="py-24 md:py-32" /> }
);
const InsightsSection = dynamic(
  () => import("@/components/landing/insights-section").then((m) => m.InsightsSection),
  { ssr: false, loading: () => <div className="py-24 md:py-32" /> }
);
const StatsSection = dynamic(
  () => import("@/components/landing/stats-section").then((m) => m.StatsSection),
  { ssr: false, loading: () => <div className="py-24 md:py-32" /> }
);
const TechStackSection = dynamic(
  () => import("@/components/landing/tech-stack-section").then((m) => m.TechStackSection),
  { ssr: false, loading: () => <div className="py-24 md:py-32" /> }
);
const ContactSection = dynamic(
  () => import("@/components/landing/contact-section").then((m) => m.ContactSection),
  { ssr: false, loading: () => <div className="py-24 md:py-32" /> }
);

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Suspense>
        <HowItWorksSection />
        <DepartmentsSection />
        <RolesSection />
        <InsightsSection />
        <StatsSection />
        <TechStackSection />
        <ContactSection />
      </Suspense>
      <Footer />
    </main>
  );
}
