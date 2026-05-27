import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "donor")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const donorId = Number(session.user.id)

  const donor = await prisma.donor.findUnique({
    where: { id: donorId },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      bloodGroup: true,
      location: true,
      availabilityStatus: true,
      lastDonationDate: true,
    },
  })

  if (!donor) return NextResponse.json({ error: "Donor not found" }, { status: 404 })

  return NextResponse.json({
    ...donor,
    lastDonationDate: donor.lastDonationDate?.toISOString() ?? null,
  })
}

const updateSchema = z.object({
  phone: z.string().min(7).optional(),
  location: z.string().min(2).optional(),
  availabilityStatus: z.enum(["AVAILABLE", "UNAVAILABLE"]).optional(),
  lastDonationDate: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "donor")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const donorId = Number(session.user.id)
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)

  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { lastDonationDate, ...rest } = parsed.data

  await prisma.donor.update({
    where: { id: donorId },
    data: {
      ...rest,
      ...(lastDonationDate !== undefined
        ? { lastDonationDate: lastDonationDate ? new Date(lastDonationDate) : null }
        : {}),
    },
  })

  return NextResponse.json({ success: true })
}
