"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, CheckCheck, Loader2, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Notification {
  id: number
  title: string
  message: string
  status: string
  createdAt: string
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHrs = Math.floor(diffMins / 60)
  if (diffHrs < 24) return `${diffHrs}h ago`
  const diffDays = Math.floor(diffHrs / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

export function NotificationsClient({
  notifications: initial,
  unreadCount: initialUnreadCount,
}: {
  notifications: Notification[]
  unreadCount: number
}) {
  const [notifications, setNotifications] = useState<Notification[]>(initial)
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount)
  const [markingAll, setMarkingAll] = useState(false)
  const [markingId, setMarkingId] = useState<number | null>(null)

  const markOneAsRead = async (id: number) => {
    if (markingId === id) return
    setMarkingId(id)
    try {
      const res = await fetch(`/api/donor/notifications/${id}`, { method: "PATCH" })
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
        )
        setUnreadCount((c) => Math.max(0, c - 1))
      }
    } catch {
      toast.error("Failed to mark notification as read")
    } finally {
      setMarkingId(null)
    }
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    setMarkingAll(true)
    try {
      const res = await fetch("/api/donor/notifications", { method: "PATCH" })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })))
        setUnreadCount(0)
        toast.success("All notifications marked as read")
      } else {
        toast.error("Failed to mark all as read")
      }
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}.`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            disabled={markingAll}
            className="text-sm w-full sm:w-auto"
          >
            {markingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Marking all…
              </>
            ) : (
              <>
                <CheckCheck className="w-4 h-4 mr-2" />
                Mark all as read
              </>
            )}
          </Button>
        )}
      </div>

      {/* List */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Bell className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-500">No notifications yet</p>
          <p className="text-xs text-gray-400 mt-1">
            You'll receive alerts for blood requests, drives, and appointments here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const isUnread = n.status === "UNREAD"
            return (
              <div
                key={n.id}
                className={cn(
                  "relative flex items-start gap-4 p-4 rounded-xl border transition-all",
                  isUnread
                    ? "border-red-200 bg-red-50/50 border-l-4 border-l-red-500"
                    : "border-gray-100 bg-white hover:bg-gray-50"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "flex items-center justify-center w-9 h-9 rounded-full shrink-0 mt-0.5",
                    isUnread ? "bg-red-100" : "bg-gray-100"
                  )}
                >
                  <Bell
                    className={cn("w-4 h-4", isUnread ? "text-red-600" : "text-gray-400")}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {isUnread && (
                        <Circle className="w-2 h-2 text-red-500 fill-red-500 shrink-0" />
                      )}
                      <p
                        className={cn(
                          "text-sm font-semibold truncate",
                          isUnread ? "text-gray-900" : "text-gray-700"
                        )}
                      >
                        {n.title}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                      {formatTime(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{n.message}</p>
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markOneAsRead(n.id)}
                      disabled={markingId === n.id}
                      className="mt-2 h-6 text-xs text-red-600 hover:text-red-700 hover:bg-red-100 px-2 py-0"
                    >
                      {markingId === n.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Mark as read"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
