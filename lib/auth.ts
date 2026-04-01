import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { resolveOrganizationUser } from "@/lib/org";

const isMongoObjectId = (value: unknown): value is string =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Development override: disable all OAuth checks to avoid
      // state/nonce cookie issues that are blocking sign-in.
      // IMPORTANT: tighten this (e.g. to ["pkce", "state"]) for production.
      checks: ["none"],
    }),
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
    async signIn({ user, account }) {
      if (account?.provider !== "google") return true;
      const email = user?.email?.trim().toLowerCase();
      if (!email) return false;

      // Only allow MES domains.
      const isMesDomain =
        email.endsWith("@student.mes.ac.in") || email.endsWith("@mes.ac.in");
      if (!isMesDomain) return false;

      // Auto-provision or normalize the user based on org rules.
      let dbUser = await prisma.user.findUnique({ where: { email } });
      if (!dbUser) {
        const resolvedUser = resolveOrganizationUser({
          email,
          department: null,
          existingRole: null,
        });

        if (!resolvedUser.isValid || !resolvedUser.role) return false;

        dbUser = await prisma.user.create({
          data: {
            email,
            name: user.name ?? email, // Prisma name is required string
            role: resolvedUser.role,
            department: resolvedUser.department,
          },
        });
      }

      return true;
    },
    async jwt({ token, user, account }) {
      // For Google OAuth: hydrate token from DB so role-based routing is correct.
      if (account?.provider === "google") {
        const email = (user?.email ?? (token.email as string | undefined))?.trim().toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            (token as any).id = dbUser.id;
            (token as any).role = dbUser.role;
            (token as any).department = dbUser.department;
            (token as any).rollNumber = dbUser.rollNumber;
          }
        }
      }

      if (user) {
        const incomingId = (user as any).id;
        if (isMongoObjectId(incomingId)) {
          (token as any).id = incomingId;
        }
        (token as any).role = (user as any).role ?? (token as any).role;
        (token as any).department = (user as any).department ?? (token as any).department;
        (token as any).rollNumber = (user as any).rollNumber ?? (token as any).rollNumber;
      }

      // Last guard: when token id is not a Mongo ObjectId, rehydrate from DB by email.
      if (!isMongoObjectId((token as any).id)) {
        const email = (user?.email ?? (token.email as string | undefined))?.trim().toLowerCase();
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            (token as any).id = dbUser.id;
            (token as any).role = dbUser.role;
            (token as any).department = dbUser.department;
            (token as any).rollNumber = dbUser.rollNumber;
          }
        }
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
    },
    async redirect({ url, baseUrl }) {
      // Always send successful OAuth logins to post-auth, which then routes by role.
      // Preserve sign-out and non-auth routes.
      const normalizedUrl = url.startsWith("/") ? `${baseUrl}${url}` : url;
      if (normalizedUrl.startsWith(`${baseUrl}/api/auth/signout`)) {
        return normalizedUrl;
      }
      // For all other auth redirects, go to centralized post-auth router.
      return `${baseUrl}/post-auth`;
    }
  },
  pages: { signIn: "/login" }
};