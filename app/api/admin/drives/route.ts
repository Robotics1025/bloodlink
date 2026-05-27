import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { createBloodDrive, getAllDrives } from "@/core/use-cases/blood-drive.actions"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const drives = await getAllDrives()
  return NextResponse.json(drives)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const data = await req.json()
  const result = await createBloodDrive({ ...data, createdById: Number(session.user.id) })
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json(result)
}
