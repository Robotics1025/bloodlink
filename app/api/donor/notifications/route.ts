import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { markAllNotificationsRead } from "@/core/use-cases/notification.actions"

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "donor")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  await markAllNotificationsRead(Number(session.user.id), "DONOR")
  return NextResponse.json({ success: true })
}
