import { NextRequest, NextResponse } from "next/server"
import { registerHospital } from "@/core/use-cases/auth.actions"

export async function POST(req: NextRequest) {
  const data = await req.json()
  const result = await registerHospital(data)
  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
  return NextResponse.json({ success: true })
}
