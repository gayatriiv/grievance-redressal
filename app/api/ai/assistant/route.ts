import { NextRequest, NextResponse } from "next/server";
import { extractComplaintDraft } from "@/lib/ai";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "student") {
    return NextResponse.json({ message: "Only students can use the complaint assistant" }, { status: 403 });
  }

  const body = await req.json();
  const messages = Array.isArray(body.messages)
    ? body.messages
        .filter(
          (message): message is { role: "user" | "assistant"; content: string } =>
            message &&
            (message.role === "user" || message.role === "assistant") &&
            typeof message.content === "string"
        )
        .slice(-10)
    : [];

  if (!messages.some((message) => message.role === "user" && message.content.trim())) {
    return NextResponse.json({ message: "Describe the issue first" }, { status: 400 });
  }

  const draft = await extractComplaintDraft(messages, body.department || sessionUser.department);
  return NextResponse.json(draft);
}