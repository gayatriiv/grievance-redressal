import { NextRequest, NextResponse } from "next/server";
import { extractComplaintDraft } from "@/lib/ai";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type AssistantRequestMessage = {
  role: "user" | "assistant";
  content: string;
};

type AssistantRequestBody = {
  messages?: unknown[];
  department?: string | null;
};

const isAssistantRequestMessage = (message: unknown): message is AssistantRequestMessage => {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const candidate = message as Partial<AssistantRequestMessage>;
  return (candidate.role === "user" || candidate.role === "assistant") && typeof candidate.content === "string";
};

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "student") {
    return NextResponse.json({ message: "Only students can use the complaint assistant" }, { status: 403 });
  }

  const body: AssistantRequestBody = await req.json();
  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter(isAssistantRequestMessage)
        .slice(-10)
    : [];

  if (!messages.some((message) => message.role === "user" && message.content.trim())) {
    return NextResponse.json({ message: "Describe the issue first" }, { status: 400 });
  }

  const draft = await extractComplaintDraft(messages, body.department || sessionUser.department);
  return NextResponse.json(draft);
}