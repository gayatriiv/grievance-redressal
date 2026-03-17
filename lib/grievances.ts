import { autoEscalateGrievanceById } from "@/lib/escalation";
import { prisma } from "@/lib/prisma";
import type { AppSessionUser } from "@/lib/session";
import { normalizeDepartmentName } from "@/lib/utils";

export const grievanceDetailInclude = {
  student: {
    select: {
      id: true,
      name: true,
      email: true,
      department: true,
      rollNumber: true,
    },
  },
  attachments: true,
  responses: {
    orderBy: { createdAt: "asc" as const },
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
  },
};

export const canAccessGrievance = (
  grievance: { studentId: string; departmentAssigned: string },
  user: AppSessionUser
) => {
  if (user.role === "admin") return true;
  if (user.role === "student") return grievance.studentId === user.id;

  const userDepartment = normalizeDepartmentName(user.department);
  return Boolean(userDepartment && grievance.departmentAssigned === userDepartment);
};

export const getAccessibleGrievance = async (grievanceId: string, user: AppSessionUser) => {
  await autoEscalateGrievanceById(grievanceId);

  const grievance = await prisma.grievance.findUnique({
    where: { id: grievanceId },
    include: grievanceDetailInclude,
  });

  if (!grievance || !canAccessGrievance(grievance, user)) {
    return null;
  }

  return grievance;
};
