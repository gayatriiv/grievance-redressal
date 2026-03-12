import type { Role } from "@prisma/client";
import { normalizeDepartmentName } from "@/lib/utils";

const STUDENT_DOMAIN = "student.mes.ac.in";
const STAFF_DOMAIN = "mes.ac.in";

const studentDepartmentHints: Array<{ tokens: string[]; department: string }> = [
  { tokens: ["comp", "cse", "cs", "computer"], department: "Computer Engineering" },
  { tokens: ["it", "informationtech"], department: "Information Technology" },
  { tokens: ["extc", "ece", "electronics"], department: "Electronics and Telecommunication" },
  { tokens: ["mech", "mechanical"], department: "Mechanical Engineering" },
  { tokens: ["civil"], department: "Civil Engineering" },
  { tokens: ["aids", "ai", "ds"], department: "Artificial Intelligence and Data Science" },
  { tokens: ["electrical", "ee"], department: "Electrical Engineering" },
];

export type ResolvedOrganizationUser = {
  isValid: boolean;
  normalizedEmail: string;
  role?: Role;
  department?: string;
  requiresDepartment?: boolean;
  message?: string;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const getAdminEmails = () =>
  new Set(
    (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean)
  );

export const isStudentEmail = (email: string) => normalizeEmail(email).endsWith(`@${STUDENT_DOMAIN}`);

export const isStaffEmail = (email: string) => {
  const normalized = normalizeEmail(email);
  return normalized.endsWith(`@${STAFF_DOMAIN}`) && !normalized.endsWith(`@${STUDENT_DOMAIN}`);
};

export const isValidCollegeEmail = (email: string) => isStudentEmail(email) || isStaffEmail(email);

export const inferDepartmentFromStudentEmail = (email: string) => {
  const localPart = normalizeEmail(email).split("@")[0] ?? "";
  for (const hint of studentDepartmentHints) {
    if (hint.tokens.some((token) => localPart.includes(token))) {
      return hint.department;
    }
  }
  return undefined;
};

export const resolveOrganizationUser = ({
  email,
  department,
  existingRole,
}: {
  email: string;
  department?: string | null;
  existingRole?: Role | null;
}): ResolvedOrganizationUser => {
  const normalizedEmail = normalizeEmail(email);
  const normalizedDepartment = normalizeDepartmentName(department);

  if (isStudentEmail(normalizedEmail)) {
    return {
      isValid: true,
      normalizedEmail,
      role: "student",
      department: normalizedDepartment ?? inferDepartmentFromStudentEmail(normalizedEmail) ?? "Student Affairs",
    };
  }

  if (isStaffEmail(normalizedEmail)) {
    if (existingRole === "admin" || getAdminEmails().has(normalizedEmail)) {
      return {
        isValid: true,
        normalizedEmail,
        role: "admin",
        department: normalizedDepartment ?? "Administration",
      };
    }

    if (!normalizedDepartment) {
      return {
        isValid: true,
        normalizedEmail,
        role: "department",
        requiresDepartment: true,
        message: "Faculty accounts must include a department.",
      };
    }

    return {
      isValid: true,
      normalizedEmail,
      role: "department",
      department: normalizedDepartment,
    };
  }

  return {
    isValid: false,
    normalizedEmail,
    message: "Use a valid MES college email address to continue.",
  };
};
