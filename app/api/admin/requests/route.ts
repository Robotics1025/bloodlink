import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllRequests } from "@/core/use-cases/blood-request.actions"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const requests = await getAllRequests()
  return NextResponse.json(requests)
}
