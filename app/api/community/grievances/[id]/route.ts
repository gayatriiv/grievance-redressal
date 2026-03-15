import { NextRequest, NextResponse } from "next/server";
import { getCommunityGrievanceById } from "@/lib/community-grievances";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const grievance = await getCommunityGrievanceById(params.id, sessionUser.id);
  if (!grievance) return NextResponse.json({ message: "Complaint not found" }, { status: 404 });

  return NextResponse.json(grievance);
}