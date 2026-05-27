"use server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const inventorySchema = z.object({
  hospitalId: z.number(),
  bloodGroup: z.enum(["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"]),
  availableUnits: z.number().min(0),
  expiryDate: z.string().optional(),
})

export async function upsertInventory(data: unknown) {
  const parsed = inventorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { hospitalId, bloodGroup, availableUnits, expiryDate } = parsed.data
  await prisma.inventory.upsert({
    where: { hospitalId_bloodGroup: { hospitalId, bloodGroup } },
    update: { availableUnits, expiryDate: expiryDate ? new Date(expiryDate) : undefined },
    create: { hospitalId, bloodGroup, availableUnits, expiryDate: expiryDate ? new Date(expiryDate) : undefined },
  })
  return { success: true }
}

export async function getHospitalInventory(hospitalId: number) {
  return prisma.inventory.findMany({ where: { hospitalId }, orderBy: { bloodGroup: "asc" } })
}

export async function getAllInventory() {
  return prisma.inventory.findMany({
    include: { hospital: { select: { hospitalName: true } } },
    orderBy: [{ hospitalId: "asc" }, { bloodGroup: "asc" }],
  })
}

export async function getLowStockInventory(threshold = 5) {
  return prisma.inventory.findMany({
    where: { availableUnits: { lte: threshold } },
    include: { hospital: { select: { hospitalName: true, location: true } } },
  })
}
