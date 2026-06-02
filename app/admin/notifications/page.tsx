"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import {
  Bell, AlertTriangle, Droplet, ShieldCheck, Clock, CheckCircle2,
  Loader2, RefreshCw, Building2, Users, Megaphone,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

/* ── Icon mapping based on notification content ── */
function getNotifIcon(title: string, msg: string) {
  const t = (title + " " + msg).toLowerCase()
  if (t.includes("critical") || t.includes("urgent") || t.includes("emergency"))
    return { icon: AlertTriangle, color: "text-[#e13a48]", bg: "bg-[#fef2f2]" }
  if (t.includes("approved") || t.includes("fulfilled") || t.includes("completed"))
    return { icon: ShieldCheck, color: "text-[#10b981]", bg: "bg-green-50" }
  if (t.includes("stock") || t.includes("blood") || t.includes("unit") || t.includes("inventory"))
    return { icon: Droplet, color: "text-blue-600", bg: "bg-blue-50" }
  if (t.includes("hospital") || t.includes("pending") || t.includes("registration"))
    return { icon: Building2, color: "text-yellow-600", bg: "bg-yellow-50" }
  if (t.includes("donor") || t.includes("appointment"))
    return { icon: Users, color: "text-purple-600", bg: "bg-purple-50" }
  return { icon: Megaphone, color: "text-slate-600", bg: "bg-slate-100" }
}

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "Just now"
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

interface Notification {
  id: number
  title: string
  message: string
  status: "UNREAD" | "READ"
  userRole: string
  createdAt: string
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/notifications")
      const data = await res.json()
      if (Array.isArray(data)) setNotifications(data)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const unreadCount = notifications.filter(n => n.status === "UNREAD").length

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 bg-[#fafbfe] min-h-screen">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0a1c35]">My Notifications</h1>
          <p className="text-sm text-slate-500 mt-1">
            View alerts, system updates, and pending actions
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          {unreadCount > 0 && (
            <Badge className="bg-[#fef2f2] text-[#e13a48] border border-red-200 font-bold text-xs px-3 py-1 rounded-full">
              {unreadCount} unread
            </Badge>
          )}
          <Button onClick={fetchNotifications} variant="outline" disabled={loading} className="gap-2 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
        </div>
      </div>

      {/* Notifications list */}
      <div className="max-w-4xl w-full">
        <Card className="shadow-sm border border-slate-100 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-[#e13a48]" />
                <p className="text-sm font-bold text-slate-400">Loading notifications…</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Bell className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-[#0a1c35]">No notifications yet</p>
                <p className="text-xs font-medium text-slate-400">You're all caught up! New alerts will appear here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {notifications.map((n) => {
                  const { icon: Icon, color, bg } = getNotifIcon(n.title, n.message)
                  const isUnread = n.status === "UNREAD"
                  return (
                    <li
                      key={n.id}
                      className={`flex items-start gap-4 px-6 py-5 transition-colors ${
                        isUnread ? "bg-white hover:bg-slate-50/50" : "bg-slate-50/30 hover:bg-slate-50/60"
                      }`}
                    >
                      {/* Icon */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`text-sm ${isUnread ? "font-bold text-[#0a1c35]" : "font-semibold text-slate-600"}`}>
                              {n.title}
                            </p>
                            <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider shrink-0 border ${
                              n.userRole === "DONOR"
                                ? "border-red-200 bg-[#fef2f2] text-[#e13a48]"
                                : n.userRole === "HOSPITAL"
                                ? "border-blue-200 bg-blue-50 text-blue-600"
                                : "border-slate-200 bg-slate-50 text-slate-600"
                            }`}>
                              {n.userRole === "DONOR" ? "Donors" : n.userRole === "HOSPITAL" ? "Hospitals" : "System"}
                            </Badge>
                          </div>
                          <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3.5 w-3.5 text-slate-300" />{timeAgo(n.createdAt)}
                          </span>
                        </div>
                        <p className={`mt-1.5 text-sm leading-relaxed ${isUnread ? "text-slate-600 font-medium" : "text-slate-500"}`}>
                          {n.message}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {isUnread && (
                        <div className="shrink-0 pt-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#e13a48] block"></span>
                        </div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
