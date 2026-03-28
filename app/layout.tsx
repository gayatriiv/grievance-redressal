import "./globals.css";
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { LenisProvider } from "@/components/lenis-provider";
import { AuthSessionProvider } from "@/components/auth-session-provider";

export const metadata: Metadata = {
  title: "AI Based Grievance Redressal System – Pillai College of Engineering",
  description:
    "A smart platform that helps students submit complaints, ensures they reach the right department, and provides transparent real-time resolution tracking.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var t = localStorage.getItem("theme");
                  if (t === "light") document.documentElement.classList.add("light");
                  else document.documentElement.classList.remove("light");
                } catch (e) {}
              })();
            `,
          }}
        />
        <LenisProvider>
          <AuthSessionProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </AuthSessionProvider>
        </LenisProvider>
      </body>
    </html>
  );
}
