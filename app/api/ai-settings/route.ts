import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { aiSettingsSchema } from "@/lib/validation";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = aiSettingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Invalid settings" }, { status: 400 });
  await prisma.aISetting.updateMany({ data: { isActive: false } });
  await prisma.aISetting.create({ data: { provider: parsed.data.provider, model: parsed.data.model, encryptedKey: encrypt(parsed.data.apiKey), createdById: sessionUser.id } });
  return NextResponse.json({ message: "AI settings saved" });
}

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const settings = await prisma.aISetting.findMany({ select: { id: true, provider: true, model: true, isActive: true, updatedAt: true }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(settings);
}
