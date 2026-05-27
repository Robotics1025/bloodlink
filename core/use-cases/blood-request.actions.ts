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

  // Requests go into the pending queue for the Admin to process
  const request = await prisma.bloodRequest.create({
    data: { hospitalId, bloodGroup, unitsRequired, urgencyLevel, reason, location, status: "PENDING", unitsFulfilled: 0 },
  })

  // Notify Admins
  const admins = await prisma.admin.findMany({ select: { id: true } })
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        userRole: "ADMIN",
        title: `New Blood Request — ${urgencyLevel}`,
        message: `Hospital ID ${hospitalId} requested ${unitsRequired} units of ${bloodGroup}.`,
        status: "UNREAD",
      })),
    })
  }

  return { success: true, requestId: request.id, status: "PENDING" }
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

export async function processBloodRequest(requestId: number, action: "APPROVE" | "CANCEL") {
  const request = await prisma.bloodRequest.findUnique({ where: { id: requestId } })
  if (!request) return { error: "Request not found" }
  if (request.status !== "PENDING" && request.status !== "PARTIAL") return { error: "Request already processed" }

  if (action === "CANCEL") {
    await prisma.bloodRequest.update({ where: { id: requestId }, data: { status: "CANCELLED" } })
    return { success: true, status: "CANCELLED" }
  }

  // Handle APPROVE
  const inventory = await prisma.inventory.findFirst({
    where: {
      hospitalId: null,
      bloodGroup: request.bloodGroup,
    },
  })
  if (!inventory || inventory.availableUnits === 0) {
    return { error: "No inventory available for this blood group." }
  }

  const unitsNeeded = request.unitsRequired - request.unitsFulfilled
  let status: "APPROVED" | "PARTIAL" = "APPROVED"
  let unitsToDeduct = unitsNeeded

  if (inventory.availableUnits < unitsNeeded) {
    status = "PARTIAL"
    unitsToDeduct = inventory.availableUnits
  }

  // Deduct inventory
  await prisma.inventory.update({
    where: { id: inventory.id },
    data: { availableUnits: inventory.availableUnits - unitsToDeduct },
  })

  // Update request
  const newFulfilled = request.unitsFulfilled + unitsToDeduct
  await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status, unitsFulfilled: newFulfilled },
  })

  // Trigger donor mobilization if we couldn't fully approve
  if (status === "PARTIAL") {
    const donors = await prisma.donor.findMany({
      where: { bloodGroup: request.bloodGroup, availabilityStatus: "AVAILABLE" },
      select: { id: true },
    })
    if (donors.length > 0) {
      await prisma.notification.createMany({
        data: donors.map((d) => ({
          userId: d.id,
          userRole: "DONOR",
          title: `Emergency Shortage — ${request.bloodGroup.replace("_", "")}`,
          message: `We urgently need donors for ${request.bloodGroup.replace("_POS", "+").replace("_NEG", "−")} to fulfill a critical request.`,
          status: "UNREAD",
        })),
      })
    }
  }

  return { success: true, status }
}
