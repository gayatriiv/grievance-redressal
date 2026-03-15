import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureCommunityGrievance, getCommunityGrievanceById } from "@/lib/community-grievances";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const commentSchema = z.object({
  message: z.string().trim().min(2).max(600),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "student") return NextResponse.json({ message: "Only students can comment on complaints" }, { status: 403 });

  const grievance = await ensureCommunityGrievance(params.id);
  if (!grievance) return NextResponse.json({ message: "Complaint not found" }, { status: 404 });

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid comment", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  await prisma.grievanceComment.create({
    data: {
      grievanceId: grievance.id,
      userId: sessionUser.id,
      message: parsed.data.message,
    },
  });

  const detail = await getCommunityGrievanceById(grievance.id, sessionUser.id);
  return NextResponse.json(detail, { status: 201 });
}