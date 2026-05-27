import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  location: z.string().min(2),
  address: z.string().min(2),
  secretKey: z.string(),
});

export async function POST(req: NextRequest) {
  const data = await req.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });

  // Require the secret key for public admin registration
  const hasSecretKey = parsed.data.secretKey === (process.env.ADMIN_SECRET_KEY ?? "bloodlink-admin-2026");
  if (!hasSecretKey)
    return NextResponse.json({ error: "Invalid Admin Secret Key" }, { status: 401 });

  const existing = await prisma.admin.findUnique({ where: { email: parsed.data.email } });
  if (existing)
    return NextResponse.json({ error: "Email already registered as admin" }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const admin = await prisma.admin.create({
    data: {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      passwordHash,
      location: parsed.data.location,
      address: parsed.data.address,
      role: "ADMIN",
    },
    select: { id: true, fullName: true, email: true, role: true, location: true, address: true, createdAt: true },
  });

  return NextResponse.json({ success: true, admin });
}
