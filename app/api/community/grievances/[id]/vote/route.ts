import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureCommunityGrievance, getCommunityGrievanceById } from "@/lib/community-grievances";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const voteSchema = z.object({
  value: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "student") return NextResponse.json({ message: "Only students can vote on complaints" }, { status: 403 });

  const grievance = await ensureCommunityGrievance(params.id);
  if (!grievance) return NextResponse.json({ message: "Complaint not found" }, { status: 404 });

  const body = await req.json();
  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid vote", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existingVote = await prisma.grievanceVote.findFirst({
    where: {
      grievanceId: grievance.id,
      userId: sessionUser.id,
    },
    select: { id: true },
  });

  if (parsed.data.value === 0) {
    if (existingVote) {
      await prisma.grievanceVote.delete({ where: { id: existingVote.id } });
    }
  } else if (existingVote) {
    await prisma.grievanceVote.update({
      where: { id: existingVote.id },
      data: { value: parsed.data.value },
    });
  } else {
    await prisma.grievanceVote.create({
      data: {
        grievanceId: grievance.id,
        userId: sessionUser.id,
        value: parsed.data.value,
      },
    });
  }

  const detail = await getCommunityGrievanceById(grievance.id, sessionUser.id);
  return NextResponse.json(detail);
}