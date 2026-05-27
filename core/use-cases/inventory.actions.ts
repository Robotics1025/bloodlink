"use server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const inventorySchema = z.object({
  hospitalId: z.number().optional(),
  bloodGroup: z.enum(["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"]),
  availableUnits: z.number().min(0),
})

export async function upsertInventory(data: unknown) {
  const parsed = inventorySchema.safeParse(data)
  if (!parsed.success) return { error: parsed.error.issues[0].message }
  const { hospitalId, bloodGroup, availableUnits } = parsed.data
  await prisma.inventory.upsert({
    where: { 
      hospitalId_bloodGroup: {
        hospitalId: hospitalId ?? null,
        bloodGroup
      }
    },
    update: { availableUnits },
    create: { hospitalId, bloodGroup, availableUnits },
  })
  return { success: true }
}

export async function getHospitalInventory(hospitalId: number) {
  return prisma.inventory.findMany({
    where: { hospitalId },
    orderBy: { bloodGroup: "asc" },
  })
}

export async function getAllInventory() {
  return prisma.inventory.findMany({
    orderBy: { bloodGroup: "asc" },
  })
}

export async function getLowStockInventory(threshold = 5) {
  return prisma.inventory.findMany({
    where: { availableUnits: { lte: threshold } },
    orderBy: { bloodGroup: "asc" },
  })
}
