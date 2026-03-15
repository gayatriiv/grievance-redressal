"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, Eye, EyeOff, Loader2, Paperclip, Send, Sparkles, X } from "lucide-react";
import { grievanceCategories } from "@/lib/utils";

type FormFields = {
  name: string;
  rollNumber: string;
  department: string;
  category: string;
  title: string;
  description: string;
};

type AssistantMessage = {
  role: "assistant" | "user";
  content: string;
};

type AssistantDraft = {
  assistantMessage: string;
  title: string;
  description: string;
  category: string;
  department: string;
  missingFields: string[];
  readyToSubmit: boolean;
};

export const GrievanceForm = ({
  defaults,
}: {
  defaults?: { name?: string | null; department?: string | null; rollNumber?: string | null };
}) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantDraft, setAssistantDraft] = useState<AssistantDraft | null>(null);
  const [assistantMessages, setAssistantMessages] = useState<AssistantMessage[]>([
    {
      role: "assistant",
      content: "Describe the issue the way you would explain it in person. I will turn it into a structured complaint and fill the form below.",
    },
  ]);
  const [fields, setFields] = useState<FormFields>({
    name: defaults?.name ?? "",
    rollNumber: defaults?.rollNumber ?? "",
    department: defaults?.department ?? "",
    category: "",
    title: "",
    description: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const assistantInputRef = useRef<HTMLTextAreaElement>(null);
  const assistantMessagesRef = useRef<HTMLDivElement>(null);

  const inputClasses =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20 placeholder:text-muted-foreground/40";

  const fieldError = (field: string) => errors[field]?.[0];

  const assistantSummary = assistantDraft
    ? assistantDraft.readyToSubmit
      ? "Draft ready to review"
      : `${assistantDraft.missingFields.length} detail${assistantDraft.missingFields.length === 1 ? "" : "s"} missing`
    : "Chat to draft your complaint";

  const assistantMeta = [assistantSummary, assistantDraft?.category, assistantDraft?.department]
    .filter(Boolean)
    .join(" · ");

  const setField = (field: keyof FormFields, value: string) => {
    setFields((current) => ({ ...current, [field]: value }));
  };

  useEffect(() => {
    if (!assistantOpen) return;
    assistantInputRef.current?.focus();
  }, [assistantOpen]);

  useEffect(() => {
    if (!assistantMessagesRef.current) return;
    assistantMessagesRef.current.scrollTo({
      top: assistantMessagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [assistantMessages, assistantLoading, assistantOpen]);

  const applyDraft = (draft: AssistantDraft) => {
    setAssistantDraft(draft);
    setFields((current) => ({
      ...current,
      department: draft.department || current.department,
      category: draft.category || current.category,
      title: draft.title || current.title,
      description: draft.description || current.description,
    }));
  };

  const runAssistant = async () => {
    if (!assistantInput.trim() || assistantLoading) return;

    const nextMessages: AssistantMessage[] = [...assistantMessages, { role: "user", content: assistantInput.trim() }];
    setAssistantMessages(nextMessages);
    setAssistantInput("");
    setAssistantLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, department: fields.department || defaults?.department || "" }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAssistantMessages([...nextMessages, { role: "assistant", content: data.message || "I could not extract the complaint details right now." }]);
        return;
      }

      applyDraft(data as AssistantDraft);
      setAssistantMessages([...nextMessages, { role: "assistant", content: data.assistantMessage }]);
    } catch {
      setAssistantMessages([...nextMessages, { role: "assistant", content: "I could not reach the AI assistant right now. You can still fill the form manually." }]);
    } finally {
      setAssistantLoading(false);
    }
  };

  const onAssistantKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey) return;
    event.preventDefault();
    void runAssistant();
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    let attachmentUrl: string | undefined;

    if (attachedFile) {
      const uploadForm = new FormData();
      uploadForm.append("file", attachedFile);
      try {
        const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setMessage(uploadData.message || "File upload failed");
          setLoading(false);
          return;
        }
        attachmentUrl = uploadData.url;
      } catch {
        setMessage("File upload failed. Please try again.");
        setLoading(false);
        return;
      }
    }

    const payload = {
      name: isAnonymous ? undefined : fields.name.trim() || undefined,
      rollNumber: isAnonymous ? undefined : fields.rollNumber.trim() || undefined,
      department: fields.department.trim() || undefined,
      category: fields.category || undefined,
      title: fields.title.trim(),
      description: fields.description.trim(),
      isAnonymous,
      attachment: attachmentUrl,
    };

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

  return (
    <>
      <form onSubmit={onSubmit} className="clean-card space-y-5 p-8 pb-24">
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

      {!isAnonymous && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="g-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Name</label>
            <input id="g-name" name="name" placeholder="Your full name" className={inputClasses} value={fields.name} onChange={(e) => setField("name", e.target.value)} required />
            {fieldError("name") && <p className="mt-1 text-xs text-red-400">{fieldError("name")}</p>}
          </div>
          <div>
            <label htmlFor="g-roll" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Roll Number</label>
            <input id="g-roll" name="rollNumber" placeholder="e.g. 616" className={inputClasses} value={fields.rollNumber} onChange={(e) => setField("rollNumber", e.target.value)} required />
            {fieldError("rollNumber") && <p className="mt-1 text-xs text-red-400">{fieldError("rollNumber")}</p>}
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="g-dept" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Department</label>
          <input id="g-dept" name="department" placeholder="e.g. Computer Engineering" className={inputClasses} value={fields.department} onChange={(e) => setField("department", e.target.value)} required />
          {fieldError("department") && <p className="mt-1 text-xs text-red-400">{fieldError("department")}</p>}
        </div>
        <div>
          <label htmlFor="g-cat" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Category</label>
          <select id="g-cat" name="category" className={inputClasses} value={fields.category} onChange={(e) => setField("category", e.target.value)}>
            <option value="">Auto-detect category</option>
            {grievanceCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="g-title" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Grievance Title</label>
        <input id="g-title" name="title" placeholder="Brief title of your grievance" className={inputClasses} value={fields.title} onChange={(e) => setField("title", e.target.value)} required />
        {fieldError("title") && <p className="mt-1 text-xs text-red-400">{fieldError("title")}</p>}
      </div>

      <div>
        <label htmlFor="g-desc" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</label>
        <textarea id="g-desc" name="description" rows={5} minLength={15} placeholder="Describe your grievance in detail (min 15 characters)" className={inputClasses + " resize-none"} value={fields.description} onChange={(e) => setField("description", e.target.value)} required />
        {fieldError("description") && <p className="mt-1 text-xs text-red-400">{fieldError("description")}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Attachment <span className="font-normal">(optional)</span>
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
        />
        {attachedFile ? (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-4 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm text-foreground">{attachedFile.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">({(attachedFile.size / 1024).toFixed(0)} KB)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setAttachedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Remove attachment"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background/50 px-4 py-5 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Paperclip className="h-4 w-4" />
            <span>Click to attach a file</span>
            <span className="text-xs opacity-60">(JPEG, PNG, GIF, WebP, PDF · max 5 MB)</span>
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || assistantLoading}
        className="w-full rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Submitting..." : isAnonymous ? "Submit Anonymously" : "Submit Grievance"}
      </button>

      {message && (
        <p className={"text-center text-sm " + (message.includes("error") || message.includes("wrong") ? "text-red-400" : "text-emerald-400")}>
          {message}
        </p>
      )}
      </form>

      <div className="fixed inset-x-4 bottom-4 z-40 sm:inset-x-auto sm:right-6 sm:w-[24rem]">
        {assistantOpen ? (
          <section className="flex max-h-[calc(100vh-7rem)] flex-col overflow-hidden rounded-[1.75rem] border border-border bg-card/95 shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="border-b border-border bg-foreground/[0.04] px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-background px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI Complaint Assistant
                  </div>
                  <p className="mt-2 truncate text-xs text-muted-foreground">{assistantMeta || "Describe the issue and I will draft the complaint."}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssistantOpen(false)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Close AI complaint assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div ref={assistantMessagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {assistantMessages.map((entry, index) => (
                <div key={`${entry.role}-${index}`} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      entry.role === "user"
                        ? "bg-foreground text-background"
                        : "border border-border bg-background text-foreground"
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-wider opacity-70">
                      {entry.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : null}
                      <span>{entry.role === "assistant" ? "Assistant" : "You"}</span>
                    </div>
                    <p>{entry.content}</p>
                  </div>
                </div>
              ))}

              {assistantLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Extracting complaint details...
                  </div>
                </div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                void runAssistant();
              }}
              className="border-t border-border bg-background/60 px-4 py-3"
            >
              <textarea
                ref={assistantInputRef}
                id="assistant-input"
                rows={3}
                value={assistantInput}
                onChange={(e) => setAssistantInput(e.target.value)}
                onKeyDown={onAssistantKeyDown}
                placeholder="Tell the assistant what happened..."
                className={inputClasses + " resize-none"}
              />
              <div className="mt-3 flex items-end justify-between gap-3">
                <p className="text-xs text-muted-foreground">Press Enter to send, Shift + Enter for a new line.</p>
                <button
                  type="submit"
                  disabled={loading || assistantLoading || !assistantInput.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {assistantLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {assistantLoading ? "Analyzing..." : "Send"}
                </button>
              </div>
            </form>
          </section>
        ) : (
          <button
            type="button"
            onClick={() => setAssistantOpen(true)}
            className="flex w-full items-center gap-3 rounded-2xl border border-foreground/15 bg-background/95 px-4 py-3 text-left shadow-[0_20px_60px_rgba(0,0,0,0.3)] backdrop-blur-xl transition-transform hover:-translate-y-0.5 sm:w-auto sm:min-w-[20rem]"
            aria-expanded={assistantOpen}
            aria-label="Open AI complaint assistant"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">AI Complaint Assistant</p>
              <p className="truncate text-xs text-muted-foreground">{assistantMeta}</p>
            </div>
            <Sparkles className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        )}
      </div>
    </>
  );
};
