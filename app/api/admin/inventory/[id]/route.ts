import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { upsertInventory } from "@/core/use-cases/inventory.actions"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  // Get existing inventory to preserve hospitalId and bloodGroup
  const existing = await prisma.inventory.findUnique({ where: { id: Number(id) } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })
  const result = await upsertInventory({
    hospitalId: existing.hospitalId ?? undefined,
    bloodGroup: existing.bloodGroup,
    availableUnits: data.availableUnits ?? existing.availableUnits,
  })
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json(result)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  await prisma.inventory.delete({ where: { id: Number(id) } })
  return NextResponse.json({ success: true })
}
