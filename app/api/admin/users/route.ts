import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { adminCreateUserSchema, adminUpdateUserSchema } from "@/lib/validation";
import { resolveOrganizationUser } from "@/lib/org";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      rollNumber: true,
      createdAt: true,
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = adminCreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const resolved = resolveOrganizationUser({
    email: parsed.data.email,
    department: parsed.data.department,
    existingRole: parsed.data.role,
  });

  if (!resolved.isValid || !resolved.role) {
    return NextResponse.json({ message: resolved.message ?? "Invalid email" }, { status: 400 });
  }
  if (resolved.requiresDepartment) {
    return NextResponse.json({ message: resolved.message ?? "Department is required" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: resolved.normalizedEmail } });
  if (existing) return NextResponse.json({ message: "User already exists" }, { status: 409 });

  const created = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email: resolved.normalizedEmail,
      role: resolved.role,
      department: resolved.department,
      rollNumber: resolved.role === "student" ? parsed.data.rollNumber ?? null : null,
      passwordHash: null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      rollNumber: true,
      createdAt: true,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = adminUpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { id, name, role, department, rollNumber } = parsed.data;

  const updates: any = {};
  if (name !== undefined) updates.name = name.trim();
  if (role !== undefined) updates.role = role;
  if (department !== undefined) updates.department = department;
  if (role === "student") {
    updates.rollNumber = rollNumber ?? null;
  } else if (rollNumber !== undefined) {
    updates.rollNumber = null;
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updates,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      rollNumber: true,
      createdAt: true,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ message: "User id is required" }, { status: 400 });

  // Prevent self-deletion to avoid locking out the last admin
  if (id === sessionUser.id) {
    return NextResponse.json({ message: "You cannot delete your own account from here." }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

