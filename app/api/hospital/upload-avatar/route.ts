import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "hospital")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("avatar") as File | null
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })
  if (!file.type.startsWith("image/"))
    return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 })
  if (file.size > 2 * 1024 * 1024)
    return NextResponse.json({ error: "File must be under 2 MB" }, { status: 400 })

  const ext = file.name.split(".").pop() ?? "jpg"
  const filename = `hospital-${session.user.id}.${ext}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "avatars")
  await mkdir(uploadDir, { recursive: true })
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(path.join(uploadDir, filename), buffer)

  const avatarUrl = `/uploads/avatars/${filename}`
  await prisma.hospital.update({
    where: { id: Number(session.user.id) },
    data: { avatarUrl },
  })

  return NextResponse.json({ avatarUrl })
}
