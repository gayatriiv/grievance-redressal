import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export type AIClassification = {
  category: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  summary: string;
};

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const classificationPrompt = `You triage college grievances. Categorize the complaint into one category from: Academic Issues, Hostel Issues, Infrastructure Problems, Faculty Complaints, Administration Issues, Exam / Results, Library, Other. Return strict JSON in this exact shape: {"category":"","urgency":"Low|Medium|High|Critical","summary":""}. Keep the summary under 35 words.`;

const insightPrompt = `You analyze grievance patterns for a college dashboard. Return strict JSON in this exact shape: {"summary":"","recurringProblems":["","",""],"recommendedActions":["","",""]}. Keep each item short and actionable.`;

const safeJsonParse = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

const callGroq = async (apiKey: string, model: string, messages: Array<{ role: "system" | "user"; content: string }>) => {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages })
  });

  if (!res.ok) {
    throw new Error(`Groq request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "{}";
};

const getGroqConfig = async () => {
  if (process.env.GROQ_API_KEY) {
    return { apiKey: process.env.GROQ_API_KEY, model: DEFAULT_GROQ_MODEL };
  }

  const setting = await prisma.aISetting.findFirst({ where: { isActive: true, provider: "groq" }, orderBy: { updatedAt: "desc" } });
  if (!setting) return null;
  return { apiKey: decrypt(setting.encryptedKey), model: setting.model || DEFAULT_GROQ_MODEL };
};

const fallbackClassification = (text: string): AIClassification => {
  const normalized = text.toLowerCase();
  const category = normalized.includes("exam") || normalized.includes("marks")
    ? "Exam / Results"
    : normalized.includes("hostel")
      ? "Hostel Issues"
      : normalized.includes("lab") || normalized.includes("wifi") || normalized.includes("classroom")
        ? "Infrastructure Problems"
        : normalized.includes("faculty") || normalized.includes("prof") || normalized.includes("teacher")
          ? "Faculty Complaints"
          : normalized.includes("admin") || normalized.includes("fees")
            ? "Administration Issues"
            : normalized.includes("library")
              ? "Library"
              : "Academic Issues";

  const urgency = normalized.includes("urgent") || normalized.includes("harass") || normalized.includes("unsafe") ? "High" : "Medium";

  return {
    category,
    urgency,
    summary: text.trim().slice(0, 140),
  };
};

export const classifyGrievance = async (description: string): Promise<AIClassification> => {
  const config = await getGroqConfig();
  if (!config) {
    return fallbackClassification(description);
  }

  try {
    const content = await callGroq(config.apiKey, config.model, [
      { role: "system", content: classificationPrompt },
      { role: "user", content: description },
    ]);
    const parsed = safeJsonParse<Partial<AIClassification>>(content, {});
    return {
      category: parsed.category || fallbackClassification(description).category,
      urgency: (parsed.urgency as AIClassification["urgency"]) || fallbackClassification(description).urgency,
      summary: parsed.summary || fallbackClassification(description).summary,
    };
  } catch {
    return fallbackClassification(description);
  }
};

export const summarizePatterns = async (input: string) => {
  const config = await getGroqConfig();
  if (!config) return "Recurring issues are clustered locally. Configure Groq to generate richer pattern analysis.";

  try {
    const content = await callGroq(config.apiKey, config.model, [
      { role: "system", content: insightPrompt },
      { role: "user", content: input },
    ]);
    const parsed = safeJsonParse<{ summary?: string; recurringProblems?: string[]; recommendedActions?: string[] }>(content, {});
    const recurringProblems = parsed.recurringProblems?.filter(Boolean).slice(0, 3) ?? [];
    const recommendedActions = parsed.recommendedActions?.filter(Boolean).slice(0, 2) ?? [];
    return [parsed.summary, ...recurringProblems, ...recommendedActions].filter(Boolean).join(" ");
  } catch {
    return "Recurring issues detected from recent grievances. Review the analytics dashboard for category distribution and open cases.";
  }
};
