import Link from "next/link";
import Image from "next/image";

const footerLinks = [
  { label: "Home", href: "#home" },
  { label: "Features", href: "#features" },
  { label: "Submit Grievance", href: "/submit-grievance" },
  { label: "Track Complaint", href: "/track" },
  { label: "Contact", href: "#contact" },
];

export const Footer = () => (
  <footer className="border-t border-border bg-background">
    <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
      <div className="grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image src="/pce-logo.svg" alt="PCE Logo" width={32} height={32} className="rounded-lg" />
            <div>
              <p className="text-sm font-medium text-foreground">Pillai College of Engineering</p>
              <p className="text-xs text-muted-foreground">AI Based Grievance Redressal System</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            An intelligent platform that streamlines the grievance resolution process for students and administration.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Quick Links</h4>
          <ul className="space-y-2">
            {footerLinks.map((l) => (
              <li key={l.label}>
                {l.href.startsWith("#") ? (
                  <a href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
                ) : (
                  <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Contact</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Dr. K.M. Vasudevan Pillai Campus</p>
            <p>New Panvel, Navi Mumbai &#8212; 410206</p>
            <p>support@pillai.edu</p>
          </div>
        </div>
      </div>

      <div className="mt-10 border-t border-border pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Pillai College of Engineering. All rights reserved.</p>
        <p className="text-xs text-muted-foreground">AI Based Grievance Redressal System</p>
      </div>
    </div>
    <div className="mt-6 text-center">
  <p className="text-sm">
    Developed as part of learning at{" "}
    <a 
      href="https://www.pce.ac.in"
      target="_blank"
      className="text-blue-500 underline"
    >
      Pillai College of Engineering
    </a>
  </p>

  <a
    href="/contributors"
    target="_blank"
    className="text-blue-500 underline text-sm"
  >
    View Contributors
  </a>
</div>
</footer>
);
