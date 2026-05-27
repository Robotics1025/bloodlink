import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "donor")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const drives = await prisma.bloodDrive.findMany({
    where: { status: "PUBLISHED", date: { gte: new Date() } },
    orderBy: { date: "asc" },
    select: {
      id: true,
      title: true,
      location: true,
      date: true,
      startTime: true,
      endTime: true,
      status: true,
      description: true,
    },
  })

  const serialized = drives.map((d) => ({
    ...d,
    date: d.date.toISOString(),
  }))

  return NextResponse.json(serialized)
}
