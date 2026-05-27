import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { updateDriveStatus, deleteBloodDrive } from "@/core/use-cases/blood-drive.actions"

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { id } = await params
  const { status } = await req.json()
  const result = await updateDriveStatus(Number(id), status)
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
  const result = await deleteBloodDrive(Number(id))
  return NextResponse.json(result)
}
