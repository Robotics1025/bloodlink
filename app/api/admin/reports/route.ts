import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [
    requestsByGroup,
    monthlyRequests,
    hospitalStatusDist,
    inventoryByGroup,
    totalDonors,
    totalHospitals,
    totalRequests,
    fulfilledRequests,
    topHospitalsRaw,
  ] = await Promise.all([
    prisma.bloodRequest.groupBy({ by: ["bloodGroup"], _count: { id: true } }),
    prisma.bloodRequest.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.hospital.groupBy({ by: ["status"], _count: { id: true } }),
    prisma.inventory.groupBy({ by: ["bloodGroup"], _sum: { availableUnits: true } }),
    prisma.donor.count(),
    prisma.hospital.count(),
    prisma.bloodRequest.count(),
    prisma.bloodRequest.count({ where: { status: { in: ["FULFILLED", "APPROVED"] } } }),
    prisma.bloodRequest.groupBy({
      by: ["hospitalId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 5,
    }),
  ])

  // Process monthly data
  const monthlyMap: Record<string, number> = {}
  monthlyRequests.forEach((r) => {
    const key = new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
    monthlyMap[key] = (monthlyMap[key] || 0) + 1
  })
  const monthlyData = Object.entries(monthlyMap).map(([month, count]) => ({ month, count }))

  // Enrich top hospitals with name + fulfilled count
  const topHospitals = await Promise.all(
    topHospitalsRaw.map(async (h) => {
      const hospital = await prisma.hospital.findUnique({ where: { id: h.hospitalId }, select: { hospitalName: true } })
      const fulfilled = await prisma.bloodRequest.count({ where: { hospitalId: h.hospitalId, status: { in: ["FULFILLED", "APPROVED"] } } })
      return { name: hospital?.hospitalName ?? "Unknown", requests: h._count.id, fulfilled }
    }),
  )

  return NextResponse.json({
    requestsByGroup: requestsByGroup.map((r) => ({ bloodGroup: r.bloodGroup, count: r._count.id })),
    monthlyData,
    hospitalStatus: hospitalStatusDist.map((h) => ({ status: h.status, count: h._count.id })),
    inventoryByGroup: inventoryByGroup.map((i) => ({ bloodGroup: i.bloodGroup, units: i._sum.availableUnits ?? 0 })),
    totalDonors,
    totalHospitals,
    totalRequests,
    fulfilledRequests,
    topHospitals,
  })
}
