"use client";

import { useState, useEffect } from "react";
import { Star, Send, CheckCircle2, Loader2 } from "lucide-react";

type FeedbackData = {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: { name: string };
};

export const FeedbackRating = ({
  grievanceId,
  status,
  role,
}: {
  grievanceId: string;
  status: string;
  role: string;
}) => {
  const isResolved = status === "Resolved" || status === "Closed";
  const isStudent = role === "student";

  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const res = await fetch(`/api/grievances/${grievanceId}/feedback`);
        if (res.ok) {
          const data = await res.json();
          if (data.feedback) {
            setFeedback(data.feedback);
          }
        }
      } catch {
        // Silently handle — feedback area is optional
      } finally {
        setLoading(false);
      }
    };

    if (isResolved) {
      void loadFeedback();
    } else {
      setLoading(false);
    }
  }, [grievanceId, isResolved]);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a rating.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/grievances/${grievanceId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to submit feedback.");
        return;
      }

      setFeedback(data.feedback);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Don't show anything if the grievance isn't resolved
  if (!isResolved) return null;

  if (loading) {
    return (
      <div className="glass p-6 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Display existing feedback (read-only)
  if (feedback) {
    return (
      <div className="rounded-2xl border border-border bg-background/50 p-6 space-y-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <p className="text-sm font-medium text-foreground">Feedback Submitted</p>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-5 w-5 transition-colors ${
                star <= feedback.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              }`}
            />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            {feedback.rating}/5
          </span>
        </div>

        {feedback.comment && (
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Comment
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {feedback.comment}
            </p>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Submitted on {new Date(feedback.createdAt).toLocaleString()}
          {feedback.user?.name ? ` by ${feedback.user.name}` : ""}
        </p>
      </div>
    );
  }

  // Non-students see a message that no feedback has been submitted yet
  if (!isStudent) {
    return (
      <div className="rounded-2xl border border-border bg-background/50 p-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          Resolution Feedback
        </p>
        <p className="text-sm text-muted-foreground">
          No feedback submitted yet. The student will be prompted to rate the resolution.
        </p>
      </div>
    );
  }

  // Student feedback form
  return (
    <div className="rounded-2xl border border-border bg-background/50 p-6 space-y-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Resolution Feedback
        </p>
        <h3 className="mt-2 text-lg font-semibold text-foreground">
          Rate your experience
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Your grievance has been resolved. Please rate the resolution process.
        </p>
      </div>

      {submitted ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">
            Thank you for your feedback! Your response helps improve our service.
          </p>
        </div>
      ) : (
        <>
          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Rating <span className="text-red-400">*</span>
            </p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="group/star rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground/20"
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hoveredStar || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30 group-hover/star:text-muted-foreground/50"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm text-muted-foreground">
                  {rating === 1
                    ? "Poor"
                    : rating === 2
                      ? "Fair"
                      : rating === 3
                        ? "Good"
                        : rating === 4
                          ? "Very Good"
                          : "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Comment <span className="text-muted-foreground/50">(optional)</span>
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with the resolution process..."
              rows={3}
              maxLength={1000}
              className="w-full resize-none rounded-xl border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-foreground/20 focus:outline-none focus:ring-1 focus:ring-foreground/10 transition-colors"
            />
            <p className="text-right text-xs text-muted-foreground/50">
              {comment.length}/1000
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || rating === 0}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Feedback
          </button>
        </>
      )}
    </div>
  );
};
