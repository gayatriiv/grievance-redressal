import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAccessibleGrievance } from "@/lib/grievances";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";

const responseSchema = z.object({
  message: z.string().trim().min(2).max(1200),
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const grievance = await getAccessibleGrievance(params.id, sessionUser);
  if (!grievance) return NextResponse.json({ message: "Grievance not found" }, { status: 404 });

  return NextResponse.json(grievance.responses);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const grievance = await getAccessibleGrievance(params.id, sessionUser);
  if (!grievance) return NextResponse.json({ message: "Grievance not found" }, { status: 404 });

  const body = await req.json();
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid message", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const nextStatus =
    sessionUser.role === "student"
      ? grievance.status === "Submitted"
        ? "UnderReview"
        : grievance.status
      : grievance.status === "Submitted" || grievance.status === "UnderReview" || grievance.status === "Assigned"
        ? "InProgress"
        : grievance.status;

  const [, response] = await prisma.$transaction([
    prisma.grievance.update({
      where: { id: grievance.id },
      data: nextStatus !== grievance.status ? { status: nextStatus } : {},
    }),
    prisma.response.create({
      data: {
        grievanceId: grievance.id,
        message: parsed.data.message,
        senderId: sessionUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true,
          },
        },
      },
    }),
  ]);

  return NextResponse.json(response, { status: 201 });
}
