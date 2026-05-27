import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllInventory, upsertInventory } from "@/core/use-cases/inventory.actions"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const inventory = await getAllInventory()
  return NextResponse.json(inventory)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const result = await upsertInventory(data)
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json(result)
}
