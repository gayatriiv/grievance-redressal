import { NextRequest, NextResponse } from "next/server";
import { getCommunityGrievances } from "@/lib/community-grievances";
import { getSessionUser } from "@/lib/session";
import { grievanceCategories } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const searchParams = new URL(req.url).searchParams;
  const category = searchParams.get("category") || undefined;
  const sort = searchParams.get("sort") === "recent" ? "recent" : "hot";

  if (category && !grievanceCategories.includes(category as (typeof grievanceCategories)[number])) {
    return NextResponse.json({ message: "Invalid category" }, { status: 400 });
  }

  const grievances = await getCommunityGrievances({
    viewerId: sessionUser.id,
    category,
    sort,
  });

  return NextResponse.json(grievances);
}