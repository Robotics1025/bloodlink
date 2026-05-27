export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { AppointmentsClient } from "./AppointmentsClient"

export default async function AppointmentsPage() {
  const session = await auth()
  if (!session || session.user.role !== "donor") {
    redirect("/login")
  }

  const donorId = Number(session.user.id)

  const appointments = await prisma.appointment.findMany({
    where: { donorId },
    include: { bloodDrive: { select: { title: true, location: true } } },
    orderBy: { appointmentDate: "desc" },
  })

  const serialized = appointments.map((a) => ({
    id: a.id,
    bloodDriveTitle: a.bloodDrive.title,
    bloodDriveLocation: a.bloodDrive.location,
    appointmentDate: a.appointmentDate.toISOString(),
    appointmentTime: a.appointmentTime,
    status: a.status,
  }))

  return <AppointmentsClient appointments={serialized} />
}
