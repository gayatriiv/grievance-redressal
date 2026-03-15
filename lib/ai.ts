import { decrypt } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { grievanceCategories, normalizeDepartmentName } from "@/lib/utils";

export type AIClassification = {
  category: string;
  urgency: "Low" | "Medium" | "High" | "Critical";
  summary: string;
};

export type ComplaintDraft = {
  assistantMessage: string;
  title: string;
  description: string;
  category: string;
  department: string;
  missingFields: string[];
  readyToSubmit: boolean;
};

const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const classificationPrompt = `You triage college grievances. Categorize the complaint into one category from: Academic Issues, Hostel Issues, Infrastructure Problems, Faculty Complaints, Administration Issues, Exam / Results, Library, Other. Return strict JSON in this exact shape: {"category":"","urgency":"Low|Medium|High|Critical","summary":""}. Keep the summary under 35 words.`;

const insightPrompt = `You analyze grievance patterns for a college dashboard. Return strict JSON in this exact shape: {"summary":"","recurringProblems":["","",""],"recommendedActions":["","",""]}. Keep each item short and actionable.`;

const assistantPrompt = `You are an AI complaint assistant for a college grievance system. Read the conversation and turn it into a structured complaint draft. Return strict JSON in this exact shape: {"assistantMessage":"","title":"","description":"","category":"Academic Issues|Hostel Issues|Infrastructure Problems|Faculty Complaints|Administration Issues|Exam / Results|Library|Other","department":"","missingFields":["department"],"readyToSubmit":true}. Rules: if the student has described any issue at all, you must generate an appropriate complaint title and a clear formal description from the student's own words. Never ask the student to write the title or description. Category must always be one of the listed values and should be chosen as the best fit even when the complaint is brief. Department should use the student's academic department if it is already known. missingFields should usually be empty and should only include department when that information is genuinely unavailable. assistantMessage should confirm what was drafted rather than asking the student to frame the complaint.`;

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
      : normalized.includes("lab") || normalized.includes("wifi") || normalized.includes("classroom") || normalized.includes("projector")
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

const sanitizeCategory = (value?: string | null) => {
  const normalizedValue = value?.trim().toLowerCase();
  if (!normalizedValue) return undefined;
  return grievanceCategories.find((category) => category.toLowerCase() === normalizedValue);
};

const normalizeComplaintText = (value: string) => value.replace(/\s+/g, " ").trim();

const capitalizeFirst = (value: string) => {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const ensureSentenceEnding = (value: string) => (/[^.!?]$/.test(value) ? `${value}.` : value);

const looksLikePlaceholder = (value?: string | null) => {
  const normalizedValue = value?.trim().toLowerCase() ?? "";
  if (!normalizedValue) return true;

  return [
    "complaint draft",
    "please describe",
    "need a concise title",
    "need more detail",
    "waiting for details",
    "tell me what happened",
    "needs title",
    "needs description",
  ].some((fragment) => normalizedValue.includes(fragment));
};

const buildComplaintTitle = (text: string, category: string) => {
  const normalizedText = normalizeComplaintText(text);
  if (!normalizedText) return `${category} complaint`;

  const firstSentence = normalizedText.split(/[.?!]/)[0]?.trim() || normalizedText;
  const simplified = firstSentence
    .replace(/^(i would like to report|i want to report|i would like to complain about|i want to complain about|complaint about|issue with)\s+/i, "")
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/\bplease\b/gi, "")
    .trim();
  const title = simplified.split(/\s+/).slice(0, 12).join(" ").replace(/[,:;]+$/, "");

  return capitalizeFirst(title || `${category} complaint`);
};

const buildComplaintDescription = (text: string) => {
  const normalizedText = normalizeComplaintText(text);
  if (!normalizedText) {
    return "The student reported a grievance and requested help drafting the complaint.";
  }

  return `The student reports the following issue: ${ensureSentenceEnding(normalizedText)}`;
};

const computeMissingFields = ({
  hasNarrative,
  department,
}: {
  hasNarrative: boolean;
  department: string;
}) => {
  if (!hasNarrative) return ["description"];
  return department ? [] : ["department"];
};

const buildAssistantMessage = ({
  category,
  missingFields,
}: {
  category: string;
  missingFields: string[];
}) => {
  if (missingFields.includes("department")) {
    return `I drafted the complaint title and description from what you shared and categorized it as ${category}. Please confirm the department before submitting.`;
  }

  return `I drafted the complaint title and description from what you shared and categorized it as ${category}. Review the form and submit if it looks right.`;
};

const fallbackComplaintDraft = (text: string, department?: string | null): ComplaintDraft => {
  const normalizedText = normalizeComplaintText(text);
  const classification = fallbackClassification(normalizedText);
  const title = buildComplaintTitle(normalizedText, classification.category);
  const description = buildComplaintDescription(normalizedText);
  const normalizedDepartment = normalizeDepartmentName(department) ?? "";
  const missingFields = computeMissingFields({
    hasNarrative: Boolean(normalizedText),
    department: normalizedDepartment,
  });

  return {
    assistantMessage: buildAssistantMessage({
      category: classification.category,
      missingFields,
    }),
    title,
    description,
    category: classification.category,
    department: normalizedDepartment,
    missingFields,
    readyToSubmit: missingFields.length === 0 && Boolean(normalizedText),
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

export const extractComplaintDraft = async (
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  department?: string | null
): Promise<ComplaintDraft> => {
  const conversation = messages
    .filter((message) => message.content.trim())
    .map((message) => `${message.role === "user" ? "Student" : "Assistant"}: ${message.content.trim()}`)
    .join("\n");
  const studentNarrative = messages
    .filter((message) => message.role === "user")
    .map((message) => message.content.trim())
    .join(" ");
  const hasNarrative = Boolean(normalizeComplaintText(studentNarrative));

  const fallback = fallbackComplaintDraft(studentNarrative, department);
  const config = await getGroqConfig();
  if (!config) {
    return fallback;
  }

  try {
    const content = await callGroq(config.apiKey, config.model, [
      { role: "system", content: assistantPrompt },
      {
        role: "user",
        content: `Student department on file: ${normalizeDepartmentName(department) ?? "Unknown"}\nConversation:\n${conversation}`,
      },
    ]);
    const parsed = safeJsonParse<Partial<ComplaintDraft>>(content, {});
    const category = sanitizeCategory(parsed.category) ?? fallback.category;
    const normalizedDepartment = normalizeDepartmentName(parsed.department) ?? normalizeDepartmentName(department) ?? fallback.department;
    const title = looksLikePlaceholder(parsed.title) ? fallback.title : parsed.title?.trim() || fallback.title;
    const description = looksLikePlaceholder(parsed.description)
      ? fallback.description
      : parsed.description?.trim() || fallback.description;
    const missingFields = computeMissingFields({
      hasNarrative,
      department: normalizedDepartment,
    });

    return {
      assistantMessage: buildAssistantMessage({
        category,
        missingFields,
      }),
      title,
      description,
      category,
      department: normalizedDepartment,
      missingFields,
      readyToSubmit: missingFields.length === 0 && hasNarrative,
    };
  } catch {
    return fallback;
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
