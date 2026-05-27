import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getHospitalRequests } from "@/core/use-cases/blood-request.actions"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "hospital")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const requests = await getHospitalRequests(Number(session.user.id))
  return NextResponse.json(requests)
}
