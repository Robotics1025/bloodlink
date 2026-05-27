import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getAllHospitals } from "@/core/use-cases/admin.actions"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const hospitals = await getAllHospitals()
  return NextResponse.json(hospitals)
}
