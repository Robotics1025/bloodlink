import { NextRequest, NextResponse } from "next/server"
import { registerHospital } from "@/core/use-cases/auth.actions"

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const result = await registerHospital(data)
    if (result.error) return NextResponse.json({ error: result.error }, { status: 400 })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) ?? 'Unknown error' }, { status: 500 })
  }
}
