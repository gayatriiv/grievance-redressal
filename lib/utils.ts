import { clsx } from "clsx";

export const cn = (...classes: Array<string | false | null | undefined>) => clsx(classes);

export const grievanceCategories = [
  "Academic Issues",
  "Hostel Issues",
  "Infrastructure Problems",
  "Faculty Complaints",
  "Administration Issues",
  "Exam / Results",
  "Library",
  "Other",
] as const;

export const grievanceStatusValues = ["Submitted", "UnderReview", "Assigned", "InProgress", "Escalated", "Resolved", "Closed"] as const;

const grievanceStatusLabels: Record<(typeof grievanceStatusValues)[number], string> = {
  Submitted: "Submitted",
  UnderReview: "Under Review",
  Assigned: "Assigned",
  InProgress: "In Progress",
  Escalated: "Escalated",
  Resolved: "Resolved",
  Closed: "Closed",
};

const departmentAliases: Record<string, string> = {
  ce: "Computer Engineering",
  comp: "Computer Engineering",
  computerengineering: "Computer Engineering",
  cse: "Computer Engineering",
  cs: "Computer Engineering",
  it: "Information Technology",
  informationtechnology: "Information Technology",
  extc: "Electronics and Telecommunication",
  ece: "Electronics and Telecommunication",
  electronicsandtelecommunication: "Electronics and Telecommunication",
  mech: "Mechanical Engineering",
  mechanicalengineering: "Mechanical Engineering",
  civil: "Civil Engineering",
  civilengineering: "Civil Engineering",
  aids: "Artificial Intelligence and Data Science",
  artificialintelligenceanddatascience: "Artificial Intelligence and Data Science",
  ai: "Artificial Intelligence and Data Science",
  ds: "Artificial Intelligence and Data Science",
  admin: "Administration",
};

const normalizeKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

export const normalizeDepartmentName = (value?: string | null) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) return undefined;
  return departmentAliases[normalizeKey(trimmedValue)] ?? trimmedValue;
};

export const formatGrievanceStatus = (status?: string | null) => {
  if (!status) return "Unknown";
  const normalizedStatus = status.replace(/\s+/g, "") as (typeof grievanceStatusValues)[number];
  return grievanceStatusLabels[normalizedStatus] ?? status.replace(/([a-z])([A-Z])/g, "$1 $2");
};

export const categoryDepartmentMap: Record<string, string> = {
  "Academic Issues": "Academic Office",
  "Hostel Issues": "Hostel Administration",
  "Infrastructure Problems": "Maintenance Department",
  "Faculty Complaints": "HOD",
  "Administration Issues": "Admin Office",
  "Exam / Results": "Examination Cell",
  Library: "Library Staff",
  Other: "General Administration"
};

export const resolveDepartmentAssignment = (category: string, department?: string | null) => {
  const normalizedDepartment = normalizeDepartmentName(department);

  if (category === "Academic Issues" || category === "Faculty Complaints") {
    return normalizedDepartment ?? "Academic Office";
  }

  if (category === "Other") {
    return normalizedDepartment ?? "General Administration";
  }

  return categoryDepartmentMap[category] ?? normalizedDepartment ?? "General Administration";
};

export const getDashboardPathForRole = (role?: string | null) => {
  if (role === "admin") return "/admin";
  if (role === "department") return "/department";
  return "/student";
};

