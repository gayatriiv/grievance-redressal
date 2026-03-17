"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { StatusTimeline } from "@/components/dashboard/status-timeline";
import { FeedbackRating } from "@/components/dashboard/feedback-rating";
import { formatGrievanceStatus } from "@/lib/utils";

type GrievanceDetail = {
  id: string;
  title: string;
  description: string;
  summary?: string | null;
  category: string;
  urgency: string;
  status: string;
  departmentAssigned: string;
  notes?: string | null;
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
  student: { name: string; email: string; department?: string | null; rollNumber?: string | null };
  responses: Array<{
    id: string;
    message: string;
    createdAt: string;
    sender: { name: string; role: string; department?: string | null };
  }>;
};

const fetchGrievanceDetail = async (grievanceId: string) => {
  const response = await fetch(`/api/grievances/${grievanceId}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load grievance details");
  }

  return data as GrievanceDetail;
};

export const GrievanceTracker = ({ grievanceId, role }: { grievanceId: string; role: string }) => {
  const [grievance, setGrievance] = useState<GrievanceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadGrievance = async () => {
    try {
      const data = await fetchGrievanceDetail(grievanceId);
      setGrievance(data);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load grievance details right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      try {
        const data = await fetchGrievanceDetail(grievanceId);
        if (!active) return;
        setGrievance(data);
        setError("");
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : "Unable to load grievance details right now.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void refresh();
    const interval = window.setInterval(() => {
      void refresh();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [grievanceId]);

  const chatHref = role === "department" ? `/department/chat?grievanceId=${grievanceId}` : `/chat?grievanceId=${grievanceId}`;

  if (loading) {
    return (
      <div className="glass flex min-h-[18rem] items-center justify-center p-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !grievance) {
    return <div className="glass p-6 text-sm text-red-400">{error || "Grievance not found."}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="glass space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Tracking</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">Track Grievance #{grievance.id.slice(-6).toUpperCase()}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{grievance.summary || grievance.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void loadGrievance()}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/20 hover:text-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link href={chatHref} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90">
              <MessageSquare className="h-4 w-4" />
              Open Chat
            </Link>
          </div>
        </div>

        <StatusTimeline status={grievance.status} />

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
            <p className="mt-2 text-sm font-medium text-foreground">{formatGrievanceStatus(grievance.status)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Category</p>
            <p className="mt-2 text-sm font-medium text-foreground">{grievance.category}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Assigned Department</p>
            <p className="mt-2 text-sm font-medium text-foreground">{grievance.departmentAssigned}</p>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Urgency</p>
            <p className="mt-2 text-sm font-medium text-foreground">{grievance.urgency}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Complaint</p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{grievance.title}</h2>
            </div>
            <p className="text-sm leading-7 text-muted-foreground">{grievance.description}</p>
            {grievance.notes && (
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Department Note</p>
                <p className="mt-2 text-sm text-foreground">{grievance.notes}</p>
              </div>
            )}
          </div>

          <div className="space-y-4 rounded-2xl border border-border bg-background/50 p-5">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Audit Trail</p>
              <p className="mt-2 text-sm text-foreground">
                Submitted by {grievance.isAnonymous && role !== "student" ? "Anonymous Student" : grievance.student.name}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Created {new Date(grievance.createdAt).toLocaleString()}</p>
              <p className="mt-1 text-sm text-muted-foreground">Last updated {new Date(grievance.updatedAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent Conversation</p>
              <div className="mt-3 space-y-3">
                {grievance.responses.length === 0 && <p className="text-sm text-muted-foreground">No messages yet. Use chat to contact the assigned department.</p>}
                {grievance.responses.slice(-3).map((response) => (
                  <div key={response.id} className="rounded-2xl border border-border bg-card p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">{response.sender.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(response.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{response.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback & Rating section — visible when grievance is resolved/closed */}
      <FeedbackRating
        grievanceId={grievanceId}
        status={grievance.status}
        role={role}
      />
    </div>
  );
};
