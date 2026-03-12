import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { resolveOrganizationUser } from "@/lib/org";
import { signupSchema } from "@/lib/validation";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: "Invalid input", errors: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, department, rollNumber } = parsed.data;

    const resolvedUser = resolveOrganizationUser({ email, department });
    if (!resolvedUser.isValid) {
      return NextResponse.json({ message: resolvedUser.message ?? "Use a valid college email address" }, { status: 400 });
    }

    if (!resolvedUser.role) {
      return NextResponse.json({ message: "Unable to determine account type from email" }, { status: 400 });
    }

    if (resolvedUser.requiresDepartment) {
      return NextResponse.json({ message: resolvedUser.message ?? "Department is required for faculty accounts" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: resolvedUser.normalizedEmail } });
    if (existing) {
      return NextResponse.json({ message: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email: resolvedUser.normalizedEmail,
        passwordHash,
        role: resolvedUser.role,
        department: resolvedUser.department,
        rollNumber,
      },
    });

    return NextResponse.json({ message: "Account created successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
