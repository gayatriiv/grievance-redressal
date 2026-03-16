import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";

export const metadata: Metadata = {
  title: "AI Based Grievance Redressal System – Pillai College of Engineering",
  description: "A smart platform that helps students submit complaints, ensures they reach the right department, and provides transparent real-time resolution tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LenisProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
