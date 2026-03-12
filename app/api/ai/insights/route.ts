import { NextRequest, NextResponse } from "next/server";
import { summarizePatterns } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { text } = await req.json();
  const insight = await summarizePatterns(text);
  return NextResponse.json({ insight });
}
