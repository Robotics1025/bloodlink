import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

const settingsSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
})

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const admin = await prisma.admin.findUnique({
    where: { id: Number(session.user.id) },
    select: { id: true, fullName: true, email: true, role: true, avatarUrl: true, createdAt: true },
  })
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(admin)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "admin")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const parsed = settingsSchema.safeParse(body)
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const { fullName, email, currentPassword, newPassword } = parsed.data
  const adminId = Number(session.user.id)

  const admin = await prisma.admin.findUnique({ where: { id: adminId } })
  if (!admin) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const updateData: { fullName?: string; email?: string; passwordHash?: string } = {}

  if (fullName) updateData.fullName = fullName

  if (email && email !== admin.email) {
    const exists = await prisma.admin.findUnique({ where: { email } })
    if (exists) return NextResponse.json({ error: "That email is already in use." }, { status: 400 })
    updateData.email = email
  }

  if (currentPassword && newPassword) {
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash)
    if (!valid) return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
    updateData.passwordHash = await bcrypt.hash(newPassword, 12)
  }

  await prisma.admin.update({ where: { id: adminId }, data: updateData })
  return NextResponse.json({ success: true })
}
