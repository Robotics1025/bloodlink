"use server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const appointmentSchema = z.object({
  donorId: z.number(),
  bloodDriveId: z.number(),
  appointmentDate: z.string(),
  appointmentTime: z.string(),
})

export async function scheduleAppointment(data: unknown) {
  const parsed = appointmentSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { donorId, bloodDriveId, appointmentDate, appointmentTime } = parsed.data

  const existing = await prisma.appointment.findFirst({
    where: { donorId, bloodDriveId },
  })
  if (existing) return { error: "You already have an appointment for this blood drive" }

  await prisma.appointment.create({
    data: {
      donorId,
      bloodDriveId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      status: "CONFIRMED",
    },
  })

  await prisma.notification.create({
    data: {
      userId: donorId,
      userRole: "DONOR",
      donorId,
      title: "Appointment Confirmed",
      message: `Your donation appointment has been confirmed for ${appointmentDate} at ${appointmentTime}.`,
      status: "UNREAD",
    },
  })

  return { success: true }
}

export async function cancelAppointment(appointmentId: number, donorId: number) {
  await prisma.appointment.updateMany({
    where: { id: appointmentId, donorId },
    data: { status: "CANCELLED" },
  })
  return { success: true }
}

export async function getDonorAppointments(donorId: number) {
  return prisma.appointment.findMany({
    where: { donorId },
    include: { bloodDrive: true },
    orderBy: { appointmentDate: "desc" },
  })
}
