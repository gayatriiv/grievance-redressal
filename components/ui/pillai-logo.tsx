import Image from "next/image";

export const PillaiLogo = () => (
  <div className="flex items-center gap-3">
    <Image src="/pce-logo.svg" alt="PCE Logo" width={40} height={40} className="rounded-lg" />
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-foreground">
        Pillai College of Engineering
      </p>
      <p className="text-[11px] text-muted-foreground">AI Grievance System</p>
    </div>
  </div>
);
