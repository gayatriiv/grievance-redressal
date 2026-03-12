"use client";

import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { StatusTimeline } from "@/components/dashboard/status-timeline";
import { formatGrievanceStatus, grievanceStatusValues } from "@/lib/utils";

type GrievanceListItem = {
  id: string;
  title: string;
  category: string;
  status: string;
  departmentAssigned: string;
  updatedAt: string;
  studentName?: string | null;
};

type GrievanceDetail = {
  id: string;
  title: string;
  description: string;
  summary?: string | null;
  category: string;
  status: string;
  urgency: string;
  departmentAssigned: string;
  responses: Array<{
    id: string;
    message: string;
    createdAt: string;
    sender: { name: string; role: string; department?: string | null };
  }>;
  student: { name: string; department?: string | null; rollNumber?: string | null };
};

const fetchChatDetail = async (grievanceId: string) => {
  const response = await fetch(`/api/grievances/${grievanceId}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load chat");
  }

  return data as GrievanceDetail;
};

export const GrievanceChat = ({
  grievances,
  role,
  defaultGrievanceId,
  emptyMessage,
}: {
  grievances: GrievanceListItem[];
  role: "student" | "department";
  defaultGrievanceId?: string;
  emptyMessage: string;
}) => {
  const initialId = defaultGrievanceId && grievances.some((grievance) => grievance.id === defaultGrievanceId)
    ? defaultGrievanceId
    : grievances[0]?.id;

  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);
  const [detail, setDetail] = useState<GrievanceDetail | null>(null);
  const [loading, setLoading] = useState(Boolean(initialId));
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string>("Submitted");

  const activeGrievance = grievances.find((grievance) => grievance.id === selectedId);

  const loadDetail = async () => {
    if (!selectedId) return;

    try {
      const data = await fetchChatDetail(selectedId);
      setDetail(data);
      setStatus(data.status);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load the latest messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedId(initialId);
  }, [initialId]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      setLoading(false);
      return;
    }

    let active = true;

    const refresh = async () => {
      try {
        const data = await fetchChatDetail(selectedId);
        if (!active) return;
        setDetail(data);
        setStatus(data.status);
        setError("");
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load the latest messages.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    setLoading(true);
    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [selectedId]);

  const sendMessage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedId || !message.trim()) return;

    setSending(true);
    setError("");

    try {
      const response = await fetch(`/api/grievances/${selectedId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to send message");
        return;
      }

      setMessage("");
      void loadDetail();
    } catch {
      setError("Unable to send message right now.");
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async () => {
    if (!selectedId || role !== "department") return;

    setSending(true);
    setError("");

    try {
      const response = await fetch(`/api/grievances/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.message || "Unable to update status");
        return;
      }

      setDetail(data);
    } catch {
      setError("Unable to update status right now.");
    } finally {
      setSending(false);
    }
  };

  if (grievances.length === 0) {
    return <div className="glass p-6 text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem,1fr]">
      <aside className="glass h-fit p-4">
        <div className="mb-4">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Conversations</p>
          <p className="mt-1 text-sm text-muted-foreground">Select a grievance to view live updates and messages.</p>
        </div>
        <div className="space-y-2">
          {grievances.map((grievance) => (
            <button
              key={grievance.id}
              type="button"
              onClick={() => setSelectedId(grievance.id)}
              className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                grievance.id === selectedId
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-background/40 text-foreground hover:border-foreground/20"
              }`}
            >
              <p className="text-sm font-medium">{grievance.title}</p>
              <p className={`mt-2 text-xs ${grievance.id === selectedId ? "text-background/70" : "text-muted-foreground"}`}>{formatGrievanceStatus(grievance.status)}</p>
              <p className={`mt-1 text-xs ${grievance.id === selectedId ? "text-background/70" : "text-muted-foreground"}`}>{new Date(grievance.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="glass p-6">
        {loading && (
          <div className="flex min-h-[18rem] items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {!loading && error && <p className="text-sm text-red-400">{error}</p>}

        {!loading && !error && detail && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{detail.category}</p>
                <h1 className="mt-2 text-2xl font-semibold text-foreground">{detail.title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{detail.summary || detail.description}</p>
              </div>

              {role === "department" && (
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Update Status</p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <select
                      value={status}
                      onChange={(event) => setStatus(event.target.value)}
                      className="rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground outline-none"
                    >
                      {grievanceStatusValues.map((value) => (
                        <option key={value} value={value}>{formatGrievanceStatus(value)}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void updateStatus()}
                      disabled={sending}
                      className="rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      Save
                    </button>
                  </div>
                </div>
              )}
            </div>

            <StatusTimeline status={detail.status} />

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Status</p>
                <p className="mt-2 text-sm font-medium text-foreground">{formatGrievanceStatus(detail.status)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Assigned Department</p>
                <p className="mt-2 text-sm font-medium text-foreground">{detail.departmentAssigned}</p>
              </div>
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Student</p>
                <p className="mt-2 text-sm font-medium text-foreground">{detail.student.name}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Messages</p>
                <p className="mt-1 text-sm text-muted-foreground">The conversation refreshes automatically every 5 seconds.</p>
              </div>
              <div className="space-y-3">
                {detail.responses.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
                {detail.responses.map((response) => (
                  <div key={response.id} className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{response.sender.name}</p>
                        <p className="text-xs text-muted-foreground">{response.sender.role === "department" ? response.sender.department || "Department" : response.sender.role}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{new Date(response.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{response.message}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={sendMessage} className="space-y-3">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={4}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20"
                  placeholder={role === "department" ? "Reply to the student or share the latest action taken..." : "Write your message to the assigned department..."}
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={sending || !message.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Send message
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!loading && !error && !detail && activeGrievance && <p className="text-sm text-muted-foreground">Select a grievance to begin.</p>}
      </section>
    </div>
  );
};
