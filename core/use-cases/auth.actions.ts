"use server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const donorSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(6),
  bloodGroup: z.enum(["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"]),
  location: z.string().min(2),
})

const hospitalSchema = z.object({
  hospitalName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(6),
  location: z.string().min(2),
  licenseNumber: z.string().min(3),
})

export async function registerDonor(data: unknown) {
  const parsed = donorSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { password, ...rest } = parsed.data
  const existing = await prisma.donor.findUnique({ where: { email: rest.email } })
  if (existing) return { error: "Email already registered" }
  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.donor.create({ data: { ...rest, passwordHash } })
  return { success: true }
}

export async function registerHospital(data: unknown) {
  const parsed = hospitalSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { password, ...rest } = parsed.data
  const existing = await prisma.hospital.findUnique({ where: { email: rest.email } })
  if (existing) return { error: "Email already registered" }
  const passwordHash = await bcrypt.hash(password, 12)
  await prisma.hospital.create({ data: { ...rest, passwordHash, status: "PENDING" } })
  return { success: true }
}
