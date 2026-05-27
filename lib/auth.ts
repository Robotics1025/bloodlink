import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["donor", "hospital", "admin"]),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password, role } = parsed.data;

        if (role === "donor") {
          const donor = await prisma.donor.findUnique({ where: { email } });
          if (!donor) return null;
          const valid = await bcrypt.compare(password, donor.passwordHash);
          if (!valid) return null;
          return {
            id: String(donor.id),
            name: donor.fullName,
            email: donor.email,
            role: "donor",
          };
        }

        if (role === "hospital") {
          const hospital = await prisma.hospital.findUnique({ where: { email } });
          if (!hospital) return null;
          const valid = await bcrypt.compare(password, hospital.passwordHash);
          if (!valid) return null;
          return {
            id: String(hospital.id),
            name: hospital.hospitalName,
            email: hospital.email,
            role: "hospital",
          };
        }

        if (role === "admin") {
          const admin = await prisma.admin.findUnique({ where: { email } });
          if (!admin) return null;
          const valid = await bcrypt.compare(password, admin.passwordHash);
          if (!valid) return null;
          return {
            id: String(admin.id),
            name: admin.fullName,
            email: admin.email,
            role: "admin",
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
