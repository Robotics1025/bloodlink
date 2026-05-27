export const dynamic = 'force-dynamic'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { NotificationsClient } from "./NotificationsClient"

export default async function NotificationsPage() {
  const session = await auth()
  if (!session || session.user.role !== "donor") {
    redirect("/login")
  }

  const donorId = Number(session.user.id)

  const notifications = await prisma.notification.findMany({
    where: { donorId },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  const serialized = notifications.map((n) => ({
    id: n.id,
    title: n.title,
    message: n.message,
    status: n.status,
    createdAt: n.createdAt.toISOString(),
  }))

  const unreadCount = serialized.filter((n) => n.status === "UNREAD").length

  return <NotificationsClient notifications={serialized} unreadCount={unreadCount} />
}
