import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/admin/login" },
  providers: [
    CredentialsProvider({
      name: "Admin login",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const normalizedEmail = credentials.email.trim().toLowerCase();
        const user = await prisma.adminUser.findUnique({
          where: { email: normalizedEmail },
        });
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password.trim(), user.passwordHash);
        if (!valid) return null;
        return { id: user.id, email: user.email, role: "admin" as const };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) (token as any).role = (user as any).role ?? "admin";
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as any).role = (token as any).role;
      }
      return session;
    },
  },
};
