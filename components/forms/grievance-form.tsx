"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeOff, Eye } from "lucide-react";

export const GrievanceForm = ({
  defaults,
}: {
  defaults?: { name?: string | null; department?: string | null; rollNumber?: string | null };
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const payload = { ...Object.fromEntries(formData.entries()), isAnonymous };

    try {
      const res = await fetch("/api/grievances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors || {});
        setMessage(data.message || "Something went wrong");
        setLoading(false);
        return;
      }

      setMessage("Grievance submitted. Redirecting to home...");
      router.push("/");
    } catch {
      setMessage("Network error. Please try again.");
    }

    setLoading(false);
  };

  const inputClasses =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20 placeholder:text-muted-foreground/40";

  const fieldError = (field: string) => errors[field]?.[0];

  return (
    <form onSubmit={onSubmit} className="clean-card space-y-5 p-8">
      {/* Anonymous Toggle */}
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background/50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
            {isAnonymous ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Submit Anonymously</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {isAnonymous
                ? "Your name and roll number will not be visible to staff."
                : "Enable to hide your identity from department staff and admins."}
            </p>
          </div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={isAnonymous}
          onClick={() => setIsAnonymous((prev) => !prev)}
          className={`relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none ${isAnonymous ? "bg-foreground" : "bg-border"}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${isAnonymous ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
      </div>

      {/* Name & Roll Number — hidden when anonymous */}
      {!isAnonymous && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="g-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
            <input id="g-name" name="name" placeholder="Your full name" className={inputClasses} defaultValue={defaults?.name ?? ""} required />
            {fieldError("name") && <p className="mt-1 text-xs text-red-400">{fieldError("name")}</p>}
          </div>
          <div>
            <label htmlFor="g-roll" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Roll Number</label>
            <input id="g-roll" name="rollNumber" placeholder="e.g. 616" className={inputClasses} defaultValue={defaults?.rollNumber ?? ""} required />
            {fieldError("rollNumber") && <p className="mt-1 text-xs text-red-400">{fieldError("rollNumber")}</p>}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="g-dept" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</label>
          <input id="g-dept" name="department" placeholder="e.g. Computer Engineering" className={inputClasses} defaultValue={defaults?.department ?? ""} required />
          {fieldError("department") && <p className="mt-1 text-xs text-red-400">{fieldError("department")}</p>}
        </div>
        <div>
          <label htmlFor="g-cat" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
          <select id="g-cat" name="category" className={inputClasses}>
            <option value="">Auto-detect category</option>
            <option>Academic Issues</option>
            <option>Hostel Issues</option>
            <option>Infrastructure Problems</option>
            <option>Faculty Complaints</option>
            <option>Administration Issues</option>
            <option>Exam / Results</option>
            <option>Library</option>
            <option>Other</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="g-title" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Grievance Title</label>
        <input id="g-title" name="title" placeholder="Brief title of your grievance" className={inputClasses} required />
        {fieldError("title") && <p className="mt-1 text-xs text-red-400">{fieldError("title")}</p>}
      </div>

      <div>
        <label htmlFor="g-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
        <textarea id="g-desc" name="description" rows={5} minLength={15} placeholder="Describe your grievance in detail (min 15 characters)" className={inputClasses + " resize-none"} required />
        {fieldError("description") && <p className="mt-1 text-xs text-red-400">{fieldError("description")}</p>}
      </div>

      <div>
        <label htmlFor="g-attach" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Attachment URL <span className="font-normal">(optional)</span></label>
        <input id="g-attach" name="attachment" placeholder="https://..." className={inputClasses} />
        {fieldError("attachment") && <p className="mt-1 text-xs text-red-400">{fieldError("attachment")}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Submitting..." : isAnonymous ? "Submit Anonymously" : "Submit Grievance"}
      </button>

      {message && (
        <p className={"text-sm text-center " + (message.includes("error") || message.includes("wrong") ? "text-red-400" : "text-emerald-400")}>
          {message}
        </p>
      )}
    </form>
  );
};
