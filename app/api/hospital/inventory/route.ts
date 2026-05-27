import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { upsertInventory, getHospitalInventory } from "@/core/use-cases/inventory.actions"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "hospital")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const inventory = await getHospitalInventory(Number(session.user.id))
  return NextResponse.json(inventory)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "hospital")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const result = await upsertInventory({ ...data, hospitalId: Number(session.user.id) })
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
}
