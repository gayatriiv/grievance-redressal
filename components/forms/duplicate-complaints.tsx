"use client";

import { useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Copy,
  Loader2,
  ThumbsUp,
  Users,
  X,
} from "lucide-react";

type SimilarGrievance = {
  id: string;
  title: string;
  description: string;
  summary: string | null;
  category: string;
  status: string;
  urgency: string;
  departmentAssigned: string;
  createdAt: string;
  upvotes: number;
  followerCount: number;
  similarityScore: number;
  similarityReason: string;
};

const urgencyColors: Record<string, string> = {
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Critical: "bg-red-500/15 text-red-400 border-red-500/20",
};

const statusLabels: Record<string, string> = {
  Submitted: "Submitted",
  UnderReview: "Under Review",
  Assigned: "Assigned",
  InProgress: "In Progress",
  Resolved: "Resolved",
  Closed: "Closed",
};

const SimilarityBadge = ({ score }: { score: number }) => {
  const percentage = Math.round(score * 100);
  const colorClass =
    score >= 0.8
      ? "bg-red-500/15 text-red-400 border-red-500/25"
      : score >= 0.6
        ? "bg-amber-500/15 text-amber-400 border-amber-500/25"
        : "bg-sky-500/15 text-sky-400 border-sky-500/25";
  const label =
    score >= 0.8 ? "Very Similar" : score >= 0.6 ? "Similar" : "Related";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${colorClass}`}
    >
      <Copy className="h-3 w-3" />
      {percentage}% · {label}
    </span>
  );
};

const DuplicateCard = ({
  grievance,
  onJoin,
  joining,
}: {
  grievance: SimilarGrievance;
  onJoin: (id: string) => void;
  joining: string | null;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative rounded-xl border border-border bg-card/50 transition-all duration-300 hover:border-foreground/15 hover:bg-card/80">
      {/* Similarity indicator bar */}
      <div
        className="absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all"
        style={{
          background:
            grievance.similarityScore >= 0.8
              ? "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)"
              : grievance.similarityScore >= 0.6
                ? "linear-gradient(180deg, #f59e0b 0%, #d97706 100%)"
                : "linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)",
          opacity: 0.8,
        }}
      />

      <div className="p-4 pl-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <SimilarityBadge score={grievance.similarityScore} />
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${urgencyColors[grievance.urgency] || "bg-muted text-muted-foreground border-border"}`}
              >
                {grievance.urgency}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {statusLabels[grievance.status] || grievance.status}
              </span>
            </div>
            <h4 className="text-sm font-semibold leading-snug text-foreground">
              {grievance.title}
            </h4>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {grievance.similarityReason}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" />
            {grievance.upvotes} upvote{grievance.upvotes !== 1 ? "s" : ""}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="h-3 w-3" />
            {grievance.followerCount} follower
            {grievance.followerCount !== 1 ? "s" : ""}
          </span>
          <span>{grievance.category}</span>
          <span>
            {new Date(grievance.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>

        {/* Expandable description */}
        {expanded && (
          <div className="mt-3 rounded-lg border border-border bg-background/50 p-3">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {grievance.summary || grievance.description}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => onJoin(grievance.id)}
            disabled={joining === grievance.id}
            className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {joining === grievance.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <ArrowUpRight className="h-3 w-3" />
            )}
            Join this complaint
          </button>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/50 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-3 w-3" /> Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" /> Details
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DuplicateComplaints = ({
  duplicates,
  onJoin,
  onDismiss,
  joining,
}: {
  duplicates: SimilarGrievance[];
  onJoin: (id: string) => void;
  onDismiss: () => void;
  joining: string | null;
}) => {
  if (duplicates.length === 0) return null;

  const hasHighMatch = duplicates.some((d) => d.similarityScore >= 0.8);

  return (
    <div
      className="animate-in fade-in slide-in-from-top-2 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] shadow-[0_0_40px_rgba(245,158,11,0.06)]"
      style={{
        animation: "fadeSlideIn 0.4s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-amber-500/10 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              {hasHighMatch
                ? "Potential Duplicate Detected"
                : "Similar Complaints Found"}
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hasHighMatch
                ? "A very similar complaint already exists. Consider joining it to increase visibility instead of creating a new one."
                : `We found ${duplicates.length} similar complaint${duplicates.length > 1 ? "s" : ""}. You can join an existing one or continue submitting yours.`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
          aria-label="Dismiss duplicate suggestions"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Duplicate cards */}
      <div className="space-y-3 px-5 py-4">
        {duplicates.map((duplicate) => (
          <DuplicateCard
            key={duplicate.id}
            grievance={duplicate}
            onJoin={onJoin}
            joining={joining}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-amber-500/10 px-5 py-3">
        <p className="text-center text-[11px] text-muted-foreground">
          Not a duplicate?{" "}
          <button
            type="button"
            onClick={onDismiss}
            className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-amber-400"
          >
            Dismiss and continue submitting
          </button>
        </p>
      </div>

      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      ` }} />
    </div>
  );
};
