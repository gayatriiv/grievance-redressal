import { formatGrievanceStatus, grievanceStatusValues } from "@/lib/utils";

export const StatusTimeline = ({ status }: { status: string }) => {
  const normalizedStatus = status.replace(/\s+/g, "");
  const idx = grievanceStatusValues.findIndex((step) => step.toLowerCase() === normalizedStatus.toLowerCase());

  return (
    <div className="flex flex-wrap gap-4">
      {grievanceStatusValues.map((step, i) => (
        <div key={step} className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${i <= idx ? "bg-emerald-400" : "bg-muted-foreground/30"}`} />
          <span className={`text-xs ${i <= idx ? "text-foreground" : "text-muted-foreground"}`}>{formatGrievanceStatus(step)}</span>
        </div>
      ))}
    </div>
  );
};
