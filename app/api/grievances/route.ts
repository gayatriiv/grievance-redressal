import { NextRequest, NextResponse } from "next/server";
import { classifyGrievance } from "@/lib/ai";
import { autoEscalateOverdueGrievances } from "@/lib/escalation";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { normalizeDepartmentName, resolveDepartmentAssignment } from "@/lib/utils";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
import { grievanceSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "student") {
    return NextResponse.json({ message: "Only students can submit grievances" }, { status: 403 });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "local";
  if (!checkRateLimit(ip)) return NextResponse.json({ message: "Too many requests" }, { status: 429 });

  const body = await req.json();
  const parsed = grievanceSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const isAnonymous = parsed.data.isAnonymous ?? false;
  const ai = await classifyGrievance(`${parsed.data.title}\n\n${parsed.data.description}`);
  const category = parsed.data.category || ai.category;
  const department = normalizeDepartmentName(parsed.data.department || sessionUser.department) ?? "Student Affairs";
  const departmentAssigned = resolveDepartmentAssignment(category, department);
  // Always use session user's name for the linked account; anonymous flag controls visibility
  const studentName = parsed.data.name || sessionUser.name || "Student";

  const student = await prisma.user.upsert({
    where: { email: sessionUser.email },
    update: { name: studentName, department, rollNumber: parsed.data.rollNumber || sessionUser.rollNumber },
    create: { name: studentName, email: sessionUser.email, role: "student", rollNumber: parsed.data.rollNumber || sessionUser.rollNumber, department }
  });

  const grievance = await prisma.grievance.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      category,
      urgency: ai.urgency,
      summary: ai.summary,
      departmentAssigned,
      studentId: student.id,
      isAnonymous,
      attachments: body.attachment ? { create: [{ fileUrl: body.attachment }] } : undefined
    }
  });

  return NextResponse.json({
    message: "Grievance submitted successfully",
    id: grievance.id,
    status: grievance.status,
    departmentAssigned,
  });
}

const ANON_STUDENT = { id: "", name: "Anonymous", email: "", department: null, rollNumber: null };

export async function GET(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  await autoEscalateOverdueGrievances();

  const searchParams = new URL(req.url).searchParams;
  const status = searchParams.get("status") || undefined;

  const where =
    sessionUser.role === "admin"
      ? {
          ...(status ? { status: status as never } : {}),
        }
      : sessionUser.role === "department"
        ? {
            departmentAssigned: normalizeDepartmentName(sessionUser.department) ?? "__unassigned__",
            ...(status ? { status: status as never } : {}),
          }
        : {
            studentId: sessionUser.id,
            ...(status ? { status: status as never } : {}),
          };

  const items = await prisma.grievance.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          rollNumber: true,
        },
      },
      responses: {
        select: { id: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Mask student identity for anonymous grievances when the viewer is not the student owner
  const masked = items.map((item) => {
    if (item.isAnonymous && sessionUser.role !== "student") {
      return { ...item, student: ANON_STUDENT };
    }
    return item;
  });

  return NextResponse.json(masked);
}
