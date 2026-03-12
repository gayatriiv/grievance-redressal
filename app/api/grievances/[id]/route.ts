import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAccessibleGrievance, grievanceDetailInclude } from "@/lib/grievances";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { grievanceStatusValues, normalizeDepartmentName } from "@/lib/utils";

const optionalText = z
  .union([z.string().trim(), z.literal(""), z.undefined()])
  .transform((value) => {
    const normalized = typeof value === "string" ? value.trim() : "";
    return normalized || undefined;
  });

const grievanceUpdateSchema = z.object({
  status: z.enum(grievanceStatusValues).optional(),
  notes: optionalText,
  departmentAssigned: optionalText,
});

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const grievance = await getAccessibleGrievance(params.id, sessionUser);
  if (!grievance) return NextResponse.json({ message: "Grievance not found" }, { status: 404 });

  return NextResponse.json(grievance);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role === "student") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const grievance = await getAccessibleGrievance(params.id, sessionUser);
  if (!grievance) return NextResponse.json({ message: "Grievance not found" }, { status: 404 });

  const body = await req.json();
  const parsed = grievanceUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid update", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updated = await prisma.grievance.update({
    where: { id: params.id },
    data: {
      ...(parsed.data.status ? { status: parsed.data.status } : {}),
      ...(parsed.data.notes !== undefined ? { notes: parsed.data.notes } : {}),
      ...(sessionUser.role === "admin" && parsed.data.departmentAssigned
        ? { departmentAssigned: normalizeDepartmentName(parsed.data.departmentAssigned) }
        : {}),
    },
    include: grievanceDetailInclude,
  });

  return NextResponse.json(updated);
}
