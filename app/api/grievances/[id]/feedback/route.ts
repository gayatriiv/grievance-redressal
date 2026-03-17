import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { getAccessibleGrievance } from "@/lib/grievances";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (sessionUser.role !== "student") {
    return NextResponse.json({ message: "Only students can submit feedback" }, { status: 403 });
  }

  const grievance = await getAccessibleGrievance(params.id, sessionUser);
  if (!grievance) {
    return NextResponse.json({ message: "Grievance not found" }, { status: 404 });
  }

  // Only allow feedback on resolved or closed grievances
  if (grievance.status !== "Resolved" && grievance.status !== "Closed") {
    return NextResponse.json(
      { message: "Feedback can only be submitted for resolved or closed grievances" },
      { status: 400 }
    );
  }

  // Only the student who filed the grievance can submit feedback
  if (grievance.studentId !== sessionUser.id) {
    return NextResponse.json({ message: "You can only submit feedback on your own grievances" }, { status: 403 });
  }

  // Check if feedback already exists
  const existing = await prisma.feedback.findUnique({
    where: { grievanceId: params.id },
  });

  if (existing) {
    return NextResponse.json({ message: "Feedback has already been submitted for this grievance" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const feedback = await prisma.feedback.create({
    data: {
      grievanceId: params.id,
      userId: sessionUser.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment || null,
    },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  return NextResponse.json({ message: "Feedback submitted successfully", feedback });
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const grievance = await getAccessibleGrievance(params.id, sessionUser);
  if (!grievance) {
    return NextResponse.json({ message: "Grievance not found" }, { status: 404 });
  }

  const feedback = await prisma.feedback.findUnique({
    where: { grievanceId: params.id },
    include: {
      user: {
        select: { name: true },
      },
    },
  });

  return NextResponse.json({ feedback: feedback || null });
}
