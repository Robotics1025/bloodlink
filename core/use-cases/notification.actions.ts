"use server"
import { prisma } from "@/lib/prisma"

export async function getDonorNotifications(donorId: number) {
  return prisma.notification.findMany({
    where: { donorId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function getHospitalNotifications(hospitalId: number) {
  return prisma.notification.findMany({
    where: { hospitalId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export async function markNotificationRead(notificationId: number) {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { status: "READ" },
  })
  return { success: true }
}

export async function markAllNotificationsRead(userId: number, userRole: "DONOR" | "HOSPITAL" | "ADMIN") {
  await prisma.notification.updateMany({
    where: { userId, userRole, status: "UNREAD" },
    data: { status: "READ" },
  })
  return { success: true }
}

export async function broadcastNotification(data: {
  title: string
  message: string
  targetRole: "DONOR" | "HOSPITAL"
  bloodGroup?: string
}) {
  const { title, message, targetRole, bloodGroup } = data

  if (targetRole === "DONOR") {
    const donors = await prisma.donor.findMany({
      where: bloodGroup ? { bloodGroup: bloodGroup as any } : undefined,
      select: { id: true },
    })
    await prisma.notification.createMany({
      data: donors.map((d) => ({
        userId: d.id,
        userRole: "DONOR",
        donorId: d.id,
        title,
        message,
        status: "UNREAD",
      })),
    })
    return { success: true, sent: donors.length }
  }

  if (targetRole === "HOSPITAL") {
    const hospitals = await prisma.hospital.findMany({
      where: { status: "APPROVED" },
      select: { id: true },
    })
    await prisma.notification.createMany({
      data: hospitals.map((h) => ({
        userId: h.id,
        userRole: "HOSPITAL",
        hospitalId: h.id,
        title,
        message,
        status: "UNREAD",
      })),
    })
    return { success: true, sent: hospitals.length }
  }

  return { error: "Invalid target role" }
}
