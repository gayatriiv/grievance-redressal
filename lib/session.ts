import type { Role } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AppSessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  department?: string | null;
  rollNumber?: string | null;
};

export const getSessionUser = async (): Promise<AppSessionUser | null> => {
  const session = await getServerSession(authOptions);
  const user = session?.user as Partial<AppSessionUser> | undefined;

  if (!user?.email) {
    return null;
  }

  if (!user.id || !user.role) {
    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) return null;
    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
      department: dbUser.department,
      rollNumber: dbUser.rollNumber,
    };
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    department: user.department,
    rollNumber: user.rollNumber,
  };
};
