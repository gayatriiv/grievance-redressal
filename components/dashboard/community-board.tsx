"use client";

import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Bell, BellOff, Loader2, MessageSquare, RefreshCw } from "lucide-react";
import { grievanceCategories, formatGrievanceStatus } from "@/lib/utils";

type CommunityGrievance = {
  id: string;
  title: string;
  description: string;
  summary?: string | null;
  category: string;
  status: string;
  urgency: string;
  departmentAssigned: string;
  reporterDepartment?: string | null;
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  downvotes: number;
  score: number;
  followerCount: number;
  commentCount: number;
  currentUserVote: number;
  isFollowing: boolean;
};

type CommunityComment = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    department?: string | null;
    role: string;
  };
};

type CommunityGrievanceDetail = CommunityGrievance & {
  comments: CommunityComment[];
};

const fetchCommunityGrievances = async ({
  category,
  sort,
}: {
  category?: string;
  sort: "hot" | "recent";
}) => {
  const params = new URLSearchParams({ sort });
  if (category) {
    params.set("category", category);
  }

  const response = await fetch(`/api/community/grievances?${params.toString()}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load community complaints");
  }

  return data as CommunityGrievance[];
};

const fetchCommunityGrievanceDetail = async (grievanceId: string) => {
  const response = await fetch(`/api/community/grievances/${grievanceId}`, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to load complaint details");
  }

  return data as CommunityGrievanceDetail;
};

export const CommunityBoard = () => {
  const [grievances, setGrievances] = useState<CommunityGrievance[]>([]);
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [detail, setDetail] = useState<CommunityGrievanceDetail | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<"hot" | "recent">("hot");
  const [commentMessage, setCommentMessage] = useState("");
  const [actionLoading, setActionLoading] = useState<"vote" | "follow" | "comment" | null>(null);

  const syncDetail = (nextDetail: CommunityGrievanceDetail) => {
    setDetail(nextDetail);
    setGrievances((current) =>
      current.map((grievance) =>
        grievance.id === nextDetail.id
          ? {
            ...grievance,
            ...nextDetail,
          }
          : grievance
      )
    );
  };

  const loadList = async () => {
    setListLoading(true);

    try {
      const data = await fetchCommunityGrievances({ category: category || undefined, sort });
      setGrievances(data);
      setError("");
      setSelectedId((current) => {
        if (current && data.some((grievance) => grievance.id === current)) {
          return current;
        }

        return data[0]?.id;
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load community complaints right now.");
      setGrievances([]);
      setSelectedId(undefined);
      setDetail(null);
    } finally {
      setListLoading(false);
    }
  };

  const loadDetail = async (grievanceId: string) => {
    setDetailLoading(true);

    try {
      const data = await fetchCommunityGrievanceDetail(grievanceId);
      setDetail(data);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load complaint details right now.");
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    void loadList();
  }, [category, sort]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    void loadDetail(selectedId);
  }, [selectedId]);

  const castVote = async (value: -1 | 1) => {
    if (!detail) return;

    setActionLoading("vote");

    try {
      const nextValue = detail.currentUserVote === value ? 0 : value;
      const response = await fetch(`/api/community/grievances/${detail.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: nextValue }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update vote");
      }

      syncDetail(data as CommunityGrievanceDetail);
    } catch (voteError) {
      setError(voteError instanceof Error ? voteError.message : "Unable to update vote right now.");
    } finally {
      setActionLoading(null);
    }
  };

  const toggleFollow = async () => {
    if (!detail) return;

    setActionLoading("follow");

    try {
      const response = await fetch(`/api/community/grievances/${detail.id}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ following: !detail.isFollowing }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update follow state");
      }

      syncDetail(data as CommunityGrievanceDetail);
    } catch (followError) {
      setError(followError instanceof Error ? followError.message : "Unable to update follow state right now.");
    } finally {
      setActionLoading(null);
    }
  };

  const submitComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!detail || !commentMessage.trim()) return;

    setActionLoading("comment");

    try {
      const response = await fetch(`/api/community/grievances/${detail.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: commentMessage.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to add comment");
      }

      syncDetail(data as CommunityGrievanceDetail);
      setCommentMessage("");
    } catch (commentError) {
      setError(commentError instanceof Error ? commentError.message : "Unable to add comment right now.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Community Complaints</h2>
          <p className="mt-1 text-sm text-muted-foreground">Support existing complaints so departments can see which issues affect multiple students.</p>
        </div>
        <button
          type="button"
          onClick={() => void loadList()}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground/20"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh board
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-full border border-border bg-background/60 p-1">
          {(["hot", "recent"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSort(option)}
              className={`rounded-full px-4 py-2 text-sm transition-colors ${sort === option ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              {option === "hot" ? "Most Supported" : "Latest"}
            </button>
          ))}
        </div>

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="rounded-full border border-border bg-background px-4 py-2 text-sm text-foreground outline-none"
        >
          <option value="">All categories</option>
          {grievanceCategories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {error && <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-400">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-[22rem,1fr]">
        <aside className="clean-card max-h-[70vh] overflow-y-auto p-4">
          <div className="space-y-3">
            {listLoading && (
              <div className="flex min-h-[12rem] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!listLoading && grievances.length === 0 && (
              <p className="rounded-2xl border border-border bg-background/50 p-4 text-sm text-muted-foreground">
                No community complaints are available yet. Non-anonymous grievances will appear here.
              </p>
            )}

            {!listLoading && grievances.map((grievance) => (
              <button
                key={grievance.id}
                type="button"
                onClick={() => setSelectedId(grievance.id)}
                className={`w-full rounded-2xl border p-4 text-left transition-colors ${selectedId === grievance.id ? "border-foreground/20 bg-foreground text-background" : "border-border bg-background/50 text-foreground hover:border-foreground/20"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-medium">{grievance.title}</p>
                    <p className={`mt-2 text-xs ${selectedId === grievance.id ? "text-background/70" : "text-muted-foreground"}`}>
                      {grievance.category} · {formatGrievanceStatus(grievance.status)}
                    </p>
                  </div>
                  <div className={`rounded-full px-2.5 py-1 text-xs font-medium ${selectedId === grievance.id ? "bg-background/15 text-background" : "bg-foreground/5 text-foreground"}`}>
                    {grievance.score}
                  </div>
                </div>
                <p className={`mt-3 line-clamp-2 text-xs leading-5 ${selectedId === grievance.id ? "text-background/80" : "text-muted-foreground"}`}>
                  {grievance.summary || grievance.description}
                </p>
                <div className={`mt-3 flex flex-wrap items-center gap-3 text-[11px] ${selectedId === grievance.id ? "text-background/70" : "text-muted-foreground"}`}>
                  <span>{grievance.upvotes} up</span>
                  <span>{grievance.downvotes} down</span>
                  <span>{grievance.commentCount} comments</span>
                  <span>{grievance.followerCount} following</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        <section className="clean-card min-h-[32rem] p-6">
          {!selectedId && !listLoading && (
            <div className="flex min-h-[24rem] items-center justify-center text-sm text-muted-foreground">
              Select a complaint to view details and support it.
            </div>
          )}

          {selectedId && detailLoading && !detail && (
            <div className="flex min-h-[24rem] items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {detail && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{detail.category}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-foreground">{detail.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{detail.description}</p>
                </div>
                <div className="rounded-2xl border border-border bg-background/60 p-4 text-sm text-muted-foreground">
                  <p>{formatGrievanceStatus(detail.status)}</p>
                  <p className="mt-2">Assigned: {detail.departmentAssigned}</p>
                  <p className="mt-2">Reported from: {detail.reporterDepartment || "Department not shared"}</p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-4">
                <button
                  type="button"
                  onClick={() => void castVote(1)}
                  disabled={actionLoading !== null}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${detail.currentUserVote === 1 ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-background/50 hover:border-foreground/20"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ArrowUp className="h-4 w-4" />
                    Upvote
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{detail.upvotes}</p>
                </button>

                <button
                  type="button"
                  onClick={() => void castVote(-1)}
                  disabled={actionLoading !== null}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${detail.currentUserVote === -1 ? "border-red-500/40 bg-red-500/10" : "border-border bg-background/50 hover:border-foreground/20"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <ArrowDown className="h-4 w-4" />
                    Downvote
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{detail.downvotes}</p>
                </button>

                <div className="rounded-2xl border border-border bg-background/50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{detail.commentCount}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void toggleFollow()}
                  disabled={actionLoading !== null}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${detail.isFollowing ? "border-sky-500/40 bg-sky-500/10" : "border-border bg-background/50 hover:border-foreground/20"}`}
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    {detail.isFollowing ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    {detail.isFollowing ? "Following" : "Follow"}
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{detail.followerCount}</p>
                </button>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-semibold text-foreground">Community Discussion</h4>
                    <p className="mt-1 text-sm text-muted-foreground">Add context, confirm the issue, or explain how it affects you too.</p>
                  </div>
                  {actionLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                </div>

                <form onSubmit={submitComment} className="mt-4 space-y-3">
                  <textarea
                    value={commentMessage}
                    onChange={(event) => setCommentMessage(event.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/20"
                    placeholder="Comment on this issue, mention how it affects you, or add supporting detail..."
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading !== null || !commentMessage.trim()}
                      className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Post comment
                    </button>
                  </div>
                </form>

                <div className="mt-6 space-y-3">
                  {detail.comments.length === 0 && <p className="text-sm text-muted-foreground">No comments yet. Be the first to support this complaint.</p>}
                  {detail.comments.map((comment) => (
                    <div key={comment.id} className="rounded-2xl border border-border bg-card p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">{comment.user.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{comment.user.department || comment.user.role}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{comment.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};