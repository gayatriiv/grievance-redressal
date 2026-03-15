import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ensureCommunityGrievance, getCommunityGrievanceById } from "@/lib/community-grievances";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const followSchema = z.object({
  following: z.boolean().optional(),
});

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "student") return NextResponse.json({ message: "Only students can follow complaints" }, { status: 403 });

  const grievance = await ensureCommunityGrievance(params.id);
  if (!grievance) return NextResponse.json({ message: "Complaint not found" }, { status: 404 });

  const body = await req.json();
  const parsed = followSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid follow request", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existingFollow = await prisma.grievanceFollow.findFirst({
    where: {
      grievanceId: grievance.id,
      userId: sessionUser.id,
    },
    select: { id: true },
  });

  const shouldFollow = parsed.data.following ?? !existingFollow;

  if (shouldFollow && !existingFollow) {
    await prisma.grievanceFollow.create({
      data: {
        grievanceId: grievance.id,
        userId: sessionUser.id,
      },
    });
  }

  if (!shouldFollow && existingFollow) {
    await prisma.grievanceFollow.delete({ where: { id: existingFollow.id } });
  }

  const detail = await getCommunityGrievanceById(grievance.id, sessionUser.id);
  return NextResponse.json(detail);
}