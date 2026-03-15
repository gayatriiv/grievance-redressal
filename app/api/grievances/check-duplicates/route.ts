import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { findSimilarGrievances } from "@/lib/duplicate-detection";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (sessionUser.role !== "student") {
    return NextResponse.json(
      { message: "Only students can check for duplicates" },
      { status: 403 }
    );
  }

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ message: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await req.json();
    const title = (body.title ?? "").trim();
    const description = (body.description ?? "").trim();
    const category = (body.category ?? "").trim() || undefined;

    if (!title && !description) {
      return NextResponse.json({ duplicates: [] });
    }

    const duplicates = await findSimilarGrievances(title, description, category);

    return NextResponse.json({ duplicates });
  } catch {
    return NextResponse.json(
      { message: "Failed to check for duplicates", duplicates: [] },
      { status: 500 }
    );
  }
}
