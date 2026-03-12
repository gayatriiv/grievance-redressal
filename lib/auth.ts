import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { resolveOrganizationUser } from "@/lib/org";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) return null;

        const resolvedUser = resolveOrganizationUser({
          email: user.email,
          department: user.department,
          existingRole: user.role,
        });

        if (!resolvedUser.isValid || !resolvedUser.role) return null;

        const profileChanged = user.role !== resolvedUser.role || user.department !== resolvedUser.department;
        const normalizedUser = profileChanged
          ? await prisma.user.update({
              where: { id: user.id },
              data: {
                role: resolvedUser.role,
                department: resolvedUser.department,
              },
            })
          : user;

        return {
          id: normalizedUser.id,
          email: normalizedUser.email,
          name: normalizedUser.name,
          role: normalizedUser.role,
          department: normalizedUser.department,
          rollNumber: normalizedUser.rollNumber,
        } as any;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = (user as any).id;
        (token as any).role = (user as any).role;
        (token as any).department = (user as any).department;
        (token as any).rollNumber = (user as any).rollNumber;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).role = (token as any).role;
        (session.user as any).department = (token as any).department;
        (session.user as any).rollNumber = (token as any).rollNumber;
      }
      return session;
    }
  },
  pages: { signIn: "/login" }
};

export default NextAuth(authOptions);
