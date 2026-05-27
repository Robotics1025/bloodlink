import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const updateSchema = z.object({
  hospitalName: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  location: z.string().min(2).optional(),
  licenseNumber: z.string().min(3).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "hospital")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const hospital = await prisma.hospital.findUnique({
    where: { id: Number(session.user.id) },
    select: {
      hospitalName: true,
      email: true,
      phone: true,
      location: true,
      licenseNumber: true,
      status: true,
      avatarUrl: true,
    },
  })

  if (!hospital) return NextResponse.json({ error: "Hospital not found" }, { status: 404 })
  return NextResponse.json(hospital)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "hospital")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const updated = await prisma.hospital.update({
    where: { id: Number(session.user.id) },
    data: parsed.data,
    select: {
      hospitalName: true,
      email: true,
      phone: true,
      location: true,
      licenseNumber: true,
    },
  })

  return NextResponse.json(updated)
}
