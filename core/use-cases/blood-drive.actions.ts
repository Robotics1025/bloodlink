"use server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const driveSchema = z.object({
  title: z.string().min(3),
  location: z.string().min(2),
  date: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  description: z.string().optional(),
  createdById: z.number(),
})

export async function createBloodDrive(data: unknown) {
  const parsed = driveSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const drive = await prisma.bloodDrive.create({
    data: { ...parsed.data, date: new Date(parsed.data.date), status: "DRAFT" },
  })
  return { success: true, driveId: drive.id }
}

export async function updateDriveStatus(driveId: number, status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED") {
  await prisma.bloodDrive.update({ where: { id: driveId }, data: { status } })
  return { success: true }
}

export async function getPublishedDrives() {
  return prisma.bloodDrive.findMany({
    where: { status: "PUBLISHED", date: { gte: new Date() } },
    orderBy: { date: "asc" },
  })
}

export async function getAllDrives() {
  return prisma.bloodDrive.findMany({
    include: { _count: { select: { appointments: true } } },
    orderBy: { date: "desc" },
  })
}

export async function deleteBloodDrive(driveId: number) {
  await prisma.bloodDrive.delete({ where: { id: driveId } })
  return { success: true }
}

export async function updateBloodDrive(driveId: number, data: unknown) {
  const parsed = driveSchema.partial().safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { date, ...rest } = parsed.data
  await prisma.bloodDrive.update({
    where: { id: driveId },
    data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
  })
  return { success: true }
}
