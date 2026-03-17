import { NextResponse } from "next/server";
import { autoEscalateOverdueGrievances } from "@/lib/escalation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/session";
import { formatGrievanceStatus } from "@/lib/utils";
import { summarizePatterns } from "@/lib/ai";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  if (sessionUser.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  await autoEscalateOverdueGrievances();

  const grievances = await prisma.grievance.findMany({
    select: {
      title: true,
      description: true,
      summary: true,
      category: true,
      status: true,
      departmentAssigned: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const total = grievances.length;
  const resolved = grievances.filter((grievance) => grievance.status === "Resolved" || grievance.status === "Closed").length;
  const open = total - resolved;
  const resolvedDurations = grievances
    .filter((grievance) => grievance.status === "Resolved" || grievance.status === "Closed")
    .map((grievance) => grievance.updatedAt.getTime() - grievance.createdAt.getTime());
  const avgResolutionDays = resolvedDurations.length
    ? Number((resolvedDurations.reduce((sum, duration) => sum + duration, 0) / resolvedDurations.length / (1000 * 60 * 60 * 24)).toFixed(1))
    : 0;

  const byCategoryMap = new Map<string, number>();
  const byStatusMap = new Map<string, number>();
  const trendMap = new Map<string, number>();

  for (const grievance of grievances) {
    byCategoryMap.set(grievance.category, (byCategoryMap.get(grievance.category) ?? 0) + 1);

    const formattedStatus = formatGrievanceStatus(grievance.status);
    byStatusMap.set(formattedStatus, (byStatusMap.get(formattedStatus) ?? 0) + 1);

    const monthKey = grievance.createdAt.toLocaleString("en-US", { month: "short" });
    trendMap.set(monthKey, (trendMap.get(monthKey) ?? 0) + 1);
  }

  const byCategory = Array.from(byCategoryMap.entries()).map(([name, value]) => ({ name, value }));
  const byStatus = Array.from(byStatusMap.entries()).map(([name, value]) => ({ name, value }));
  const trend = Array.from(trendMap.entries()).map(([month, complaints]) => ({ month, complaints }));

  const insightSource = grievances
    .slice(-20)
    .map((grievance) => `${grievance.category} | ${grievance.departmentAssigned} | ${grievance.title}: ${grievance.summary || grievance.description}`)
    .join("\n");

  const insight = grievances.length
    ? await summarizePatterns(`Analyze recurring grievance patterns from these recent complaints:\n${insightSource}`)
    : "No grievance data is available yet. Once complaints start coming in, recurring issues and accountability trends will appear here.";

  return NextResponse.json({ total, open, resolved, avgResolutionDays, byCategory, byStatus, trend, insight });
}

