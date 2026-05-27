"use server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const requestSchema = z.object({
  hospitalId: z.number(),
  bloodGroup: z.enum(["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"]),
  unitsRequired: z.number().min(1),
  urgencyLevel: z.enum(["CRITICAL","URGENT","NORMAL"]),
  reason: z.string().optional(),
  location: z.string().min(2),
})

export async function postBloodRequest(data: unknown) {
  const parsed = requestSchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { hospitalId, bloodGroup, unitsRequired, urgencyLevel, reason, location } = parsed.data

  // Check inventory
  const inventory = await prisma.inventory.findUnique({
    where: { hospitalId_bloodGroup: { hospitalId, bloodGroup } },
  })

  let status: "APPROVED" | "PARTIAL" | "PENDING" = "PENDING"
  let unitsFulfilled = 0

  if (inventory && inventory.availableUnits >= unitsRequired) {
    status = "APPROVED"
    unitsFulfilled = unitsRequired
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: { availableUnits: inventory.availableUnits - unitsRequired },
    })
  } else if (inventory && inventory.availableUnits > 0) {
    status = "PARTIAL"
    unitsFulfilled = inventory.availableUnits
    await prisma.inventory.update({
      where: { id: inventory.id },
      data: { availableUnits: 0 },
    })
  }

  const request = await prisma.bloodRequest.create({
    data: { hospitalId, bloodGroup, unitsRequired, urgencyLevel, reason, location, status, unitsFulfilled },
  })

  // Notify eligible donors if pending/partial
  if (status !== "APPROVED") {
    const donors = await prisma.donor.findMany({
      where: { bloodGroup, availabilityStatus: "AVAILABLE" },
      select: { id: true },
    })
    if (donors.length > 0) {
      await prisma.notification.createMany({
        data: donors.map((d) => ({
          userId: d.id,
          userRole: "DONOR",
          donorId: d.id,
          title: `Emergency Blood Request — ${bloodGroup.replace("_", "")}`,
          message: `A hospital needs ${unitsRequired} unit(s) of ${bloodGroup.replace("_POS", "+").replace("_NEG", "−")} blood urgently in ${location}. Please respond if available.`,
          status: "UNREAD",
        })),
      })
    }
  }

  return { success: true, requestId: request.id, status }
}

export async function getHospitalRequests(hospitalId: number) {
  return prisma.bloodRequest.findMany({
    where: { hospitalId },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAllRequests() {
  return prisma.bloodRequest.findMany({
    include: { hospital: { select: { hospitalName: true, location: true } } },
    orderBy: { createdAt: "desc" },
  })
}

export async function getPendingRequests() {
  return prisma.bloodRequest.findMany({
    where: { status: { in: ["PENDING", "PARTIAL"] } },
    include: { hospital: { select: { hospitalName: true, location: true } } },
    orderBy: [{ urgencyLevel: "asc" }, { createdAt: "asc" }],
    take: 10,
  })
}
