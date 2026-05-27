export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { BloodRequestsClient } from "./BloodRequestsClient"

export default async function BloodRequestsPage() {
  const session = await auth()
  if (!session || session.user.role !== "donor") {
    redirect("/login")
  }

  const requests = await prisma.bloodRequest.findMany({
    where: { status: { in: ["PENDING", "PARTIAL"] } },
    include: { hospital: { select: { hospitalName: true } } },
    orderBy: [{ urgencyLevel: "asc" }, { createdAt: "desc" }],
  })

  const serialized = requests.map((r) => ({
    id: r.id,
    bloodGroup: r.bloodGroup,
    hospitalName: r.hospital.hospitalName,
    unitsRequired: r.unitsRequired,
    unitsFulfilled: r.unitsFulfilled,
    urgencyLevel: r.urgencyLevel,
    location: r.location,
    status: r.status,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
  }))

  return <BloodRequestsClient requests={serialized} />
}
