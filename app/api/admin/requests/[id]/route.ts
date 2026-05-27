import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { processBloodRequest } from "@/core/use-cases/blood-request.actions"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const data = await req.json()
  const { action } = data // "APPROVE" | "CANCEL"
  
  if (!action || !["APPROVE", "CANCEL"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const result = await processBloodRequest(Number(id), action as "APPROVE" | "CANCEL")
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json(result)
}
