import { prisma } from "@/lib/prisma";
import { ESCALATION_TARGET, ESCALATION_WINDOW_HOURS, getEscalationDeadline } from "@/lib/utils";

const escalationReason = `Complaint exceeded the ${ESCALATION_WINDOW_HOURS}-hour resolution window and was escalated automatically.`;

export const autoEscalateOverdueGrievances = async () => {
  const now = new Date();
  const escalationThreshold = new Date(now.getTime() - ESCALATION_WINDOW_HOURS * 60 * 60 * 1000);

  await prisma.grievance.updateMany({
    where: {
      status: {
        notIn: ["Resolved", "Closed", "Escalated"],
      },
      escalatedAt: null,
      createdAt: {
        lte: escalationThreshold,
      },
    },
    data: {
      status: "Escalated",
      escalatedAt: now,
      escalationLevel: 1,
      escalationTarget: ESCALATION_TARGET,
      escalationReason,
    },
  });
};

export const autoEscalateGrievanceById = async (grievanceId: string) => {
  const grievance = await prisma.grievance.findUnique({
    where: { id: grievanceId },
    select: {
      id: true,
      status: true,
      createdAt: true,
      escalatedAt: true,
    },
  });

  if (!grievance) {
    return null;
  }

  const shouldEscalate =
    grievance.escalatedAt === null &&
    grievance.status !== "Resolved" &&
    grievance.status !== "Closed" &&
    grievance.status !== "Escalated" &&
    getEscalationDeadline(grievance.createdAt) <= new Date();

  if (!shouldEscalate) {
    return grievance;
  }

  await prisma.grievance.update({
    where: { id: grievanceId },
    data: {
      status: "Escalated",
      escalatedAt: new Date(),
      escalationLevel: 1,
      escalationTarget: ESCALATION_TARGET,
      escalationReason,
    },
  });

  return grievance;
};

export const getEscalationReason = () => escalationReason;
