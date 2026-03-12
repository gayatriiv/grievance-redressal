import { NextRequest, NextResponse } from "next/server";
import { classifyGrievance } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { description } = await req.json();
  const classification = await classifyGrievance(description);
  return NextResponse.json(classification);
}
