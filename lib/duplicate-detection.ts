import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export type SimilarGrievance = {
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

type AIMatch = {
  id: string;
  score: number;
  reason: string;
};

type AIDuplicateResponse = {
  matches: AIMatch[];
};

const safeJsonParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const getGroqConfig = async () => {
  if (process.env.GROQ_API_KEY) {
    return { apiKey: process.env.GROQ_API_KEY, model: DEFAULT_GROQ_MODEL };
  }

  const setting = await prisma.aISetting.findFirst({
    where: { isActive: true, provider: "groq" },
    orderBy: { updatedAt: "desc" },
  });

  if (!setting) return null;
  return { apiKey: decrypt(setting.encryptedKey), model: setting.model || DEFAULT_GROQ_MODEL };
};

const callGroq = async (
  apiKey: string,
  model: string,
  messages: Array<{ role: "system" | "user"; content: string }>
) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "{}";
};

const duplicateDetectionPrompt = `You are a duplicate complaint detector for a college grievance system. You will receive the text of a NEW complaint and a list of EXISTING complaints. Your job is to identify which existing complaints are about the same or very similar issue.

Evaluate semantic similarity — not just keyword overlap. Two complaints about the same fundamental issue (e.g. "broken AC in room 401" and "AC not working in hostel room 401") should have a high score.

Return strict JSON in this exact shape:
{
  "matches": [
    { "id": "<existing complaint ID>", "score": <0.0 to 1.0>, "reason": "<brief explanation of why they are similar>" }
  ]
}

Rules:
- Only include matches with a score of 0.5 or higher.
- Score of 0.8+ means essentially the same issue.
- Score of 0.5-0.79 means related/similar issue.
- Maximum 5 matches, sorted by score descending.
- If no complaints are similar, return { "matches": [] }.
- Keep reasons concise (under 20 words).`;

/**
 * Simple text similarity using term frequency / shared-word overlap.
 * Used as a fallback when AI is not available.
 */
const computeTextSimilarity = (text1: string, text2: string): number => {
  const tokenize = (text: string) => {
    const stopWords = new Set([
      "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would", "shall",
      "should", "may", "might", "can", "could", "i", "me", "my", "we",
      "our", "you", "your", "he", "she", "it", "they", "them", "this",
      "that", "these", "those", "am", "not", "no", "nor", "so", "if",
      "or", "and", "but", "with", "at", "by", "for", "from", "in", "into",
      "of", "on", "to", "up", "out", "about", "very", "just", "also",
      "than", "then", "too", "here", "there", "when", "where", "how",
      "all", "each", "every", "both", "few", "more", "most", "other",
      "some", "such", "only", "own", "same", "as", "its",
    ]);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));
  };

  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);

  if (tokens1.length === 0 || tokens2.length === 0) return 0;

  const set1 = new Set(tokens1);
  const set2 = new Set(tokens2);

  let intersection = 0;
  for (const token of set1) {
    if (set2.has(token)) intersection++;
  }

  // Jaccard similarity
  const union = new Set([...set1, ...set2]).size;
  return union === 0 ? 0 : intersection / union;
};

/**
 * Fetches recent, open grievances that could be duplicates.
 */
const fetchCandidateGrievances = async (category?: string) => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  return prisma.grievance.findMany({
    where: {
      status: { notIn: ["Closed", "Resolved"] },
      createdAt: { gte: ninetyDaysAgo },
      ...(category ? { category } : {}),
    },
    include: {
      votes: {
        select: { value: true },
      },
      follows: {
        select: { userId: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
};

/**
 * AI-based duplicate detection using Groq LLM.
 */
const detectDuplicatesWithAI = async (
  newTitle: string,
  newDescription: string,
  candidates: Awaited<ReturnType<typeof fetchCandidateGrievances>>
): Promise<SimilarGrievance[]> => {
  const config = await getGroqConfig();
  if (!config || candidates.length === 0) return [];

  const candidateList = candidates
    .map(
      (g) =>
        `ID: ${g.id}\nTitle: ${g.title}\nDescription: ${g.description}\nCategory: ${g.category}\nStatus: ${g.status}`
    )
    .join("\n---\n");

  const userMessage = `NEW COMPLAINT:
Title: ${newTitle}
Description: ${newDescription}

EXISTING COMPLAINTS:
${candidateList}`;

  try {
    const content = await callGroq(config.apiKey, config.model, [
      { role: "system", content: duplicateDetectionPrompt },
      { role: "user", content: userMessage },
    ]);

    const parsed = safeJsonParse<AIDuplicateResponse>(content, { matches: [] });
    const matchMap = new Map(
      parsed.matches
        .filter((m) => m.score >= 0.5)
        .map((m) => [m.id, m])
    );

    return candidates
      .filter((c) => matchMap.has(c.id))
      .map((c) => {
        const match = matchMap.get(c.id)!;
        return {
          id: c.id,
          title: c.title,
          description: c.description,
          summary: c.summary,
          category: c.category,
          status: c.status,
          urgency: c.urgency,
          departmentAssigned: c.departmentAssigned,
          createdAt: c.createdAt.toISOString(),
          upvotes: c.votes.filter((v) => v.value > 0).length,
          followerCount: c.follows.length,
          similarityScore: match.score,
          similarityReason: match.reason,
        };
      })
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);
  } catch {
    return [];
  }
};

/**
 * Fallback text-based duplicate detection.
 */
const detectDuplicatesWithText = (
  newTitle: string,
  newDescription: string,
  candidates: Awaited<ReturnType<typeof fetchCandidateGrievances>>
): SimilarGrievance[] => {
  const newText = `${newTitle} ${newDescription}`;

  return candidates
    .map((c) => {
      const existingText = `${c.title} ${c.description}`;
      const score = computeTextSimilarity(newText, existingText);

      return {
        id: c.id,
        title: c.title,
        description: c.description,
        summary: c.summary,
        category: c.category,
        status: c.status,
        urgency: c.urgency,
        departmentAssigned: c.departmentAssigned,
        createdAt: c.createdAt.toISOString(),
        upvotes: c.votes.filter((v) => v.value > 0).length,
        followerCount: c.follows.length,
        similarityScore: score,
        similarityReason: "Similar keywords and topic detected",
      };
    })
    .filter((g) => g.similarityScore >= 0.35)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, 5);
};

/**
 * Main entry point: detect duplicate / similar grievances.
 * Uses AI for semantic similarity, with text-based fallback.
 */
export const findSimilarGrievances = async (
  title: string,
  description: string,
  category?: string
): Promise<SimilarGrievance[]> => {
  const candidates = await fetchCandidateGrievances(category);
  if (candidates.length === 0) return [];

  // Try AI-based detection first
  const aiResults = await detectDuplicatesWithAI(title, description, candidates);
  if (aiResults.length > 0) return aiResults;

  // Fall back to text-based detection
  return detectDuplicatesWithText(title, description, candidates);
};
