export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { DonationsClient } from "./DonationsClient"

export default async function DonationsPage() {
  const session = await auth()
  if (!session || session.user.role !== "donor") {
    redirect("/login")
  }

  const donorId = Number(session.user.id)

  const donor = await prisma.donor.findUnique({
    where: { id: donorId },
    select: { createdAt: true },
  })

  if (!donor) {
    redirect("/login")
  }

  const completedAppointments = await prisma.appointment.findMany({
    where: {
      donorId,
      status: "COMPLETED",
    },
    include: {
      bloodDrive: {
        select: {
          location: true,
        },
      },
    },
    orderBy: {
      appointmentDate: "desc",
    },
  })

  // Format data for the client
  const serializedDonations = completedAppointments.map((a) => ({
    id: a.id,
    type: "Whole Blood", // Defaulting as there is no specific type in DB schema yet
    date: new Date(a.appointmentDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    time: a.appointmentTime,
    location: a.bloodDrive.location,
    status: a.status === "COMPLETED" ? "Completed" : a.status,
  }))
  
  const memberSince = new Date(donor.createdAt).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })

  return <DonationsClient donations={serializedDonations} memberSince={memberSince} />
}
