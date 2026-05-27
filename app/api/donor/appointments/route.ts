import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { scheduleAppointment } from "@/core/use-cases/appointment.actions"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "donor")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const result = await scheduleAppointment({ ...data, donorId: Number(session.user.id) })
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
}
