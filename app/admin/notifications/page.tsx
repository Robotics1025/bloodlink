"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Send, Bell, Loader2, Users, Building2, RefreshCw,
  AlertCircle, CheckCircle2, Search, Filter,
  ChevronLeft, ChevronRight, Clock, Droplet,
  Megaphone, Zap, HeartHandshake,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { cn } from "@/lib/utils"

const BLOOD_GROUPS = [
  { value: "ALL", label: "All Blood Groups" },
  { value: "A_POS", label: "A+" }, { value: "A_NEG", label: "A−" },
  { value: "B_POS", label: "B+" }, { value: "B_NEG", label: "B−" },
  { value: "AB_POS", label: "AB+" }, { value: "AB_NEG", label: "AB−" },
  { value: "O_POS", label: "O+" }, { value: "O_NEG", label: "O−" },
]

const QUICK_TEMPLATES = [
  {
    icon: Zap,
    label: "Emergency Alert",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200 hover:bg-red-100",
    title: "🚨 Urgent Blood Needed",
    message: "A critical blood shortage has been reported. If you are available to donate, please visit your nearest hospital or blood bank immediately. Every unit matters.",
    role: "DONOR" as const,
  },
  {
    icon: HeartHandshake,
    label: "Drive Reminder",
    color: "text-green-600",
    bg: "bg-green-50 border-green-200 hover:bg-green-100",
    title: "🩸 Blood Drive This Weekend",
    message: "Don't forget — a community blood drive is happening this weekend. Book your appointment now through the Blood Link app and help save lives in your community.",
    role: "DONOR" as const,
  },
  {
    icon: Megaphone,
    label: "Hospital Update",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-200 hover:bg-blue-100",
    title: "📋 System Maintenance Notice",
    message: "Blood Link will undergo scheduled maintenance tonight from 11 PM to 1 AM EAT. Blood request submissions will be temporarily unavailable. We apologise for any inconvenience.",
    role: "HOSPITAL" as const,
  },
]

interface RecentNotification {
  id: number
  title: string
  message: string
  userRole: string
  createdAt: string
}

const PAGE_SIZE = 8

function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return "Just now"
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function BroadcastNotificationsPage() {
  const [targetRole, setTargetRole] = useState<"DONOR" | "HOSPITAL">("DONOR")
  const [bloodGroup, setBloodGroup] = useState("ALL")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [recent, setRecent] = useState<RecentNotification[]>([])
  const [loadingRecent, setLoadingRecent] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("ALL")
  const [page, setPage] = useState(1)

  const fetchRecent = useCallback(async () => {
    setLoadingRecent(true)
    try {
      const res = await fetch("/api/admin/notifications")
      const data = await res.json()
      if (Array.isArray(data)) setRecent(data)
    } finally { setLoadingRecent(false) }
  }, [])

  useEffect(() => { fetchRecent() }, [fetchRecent])
  useEffect(() => { setPage(1) }, [search, roleFilter])

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) { setError("Title and message are required."); return }
    setSending(true); setError(""); setSentCount(null)
    try {
      const payload: Record<string, string> = { title: title.trim(), message: message.trim(), targetRole }
      if (targetRole === "DONOR" && bloodGroup !== "ALL") payload.bloodGroup = bloodGroup
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      setSentCount(data.sent)
      setTitle(""); setMessage("")
      await fetchRecent()
    } finally { setSending(false) }
  }

  const filtered = useMemo(() => recent.filter((n) => {
    const q = search.toLowerCase()
    const matchSearch = !q || n.title.toLowerCase().includes(q) || n.message.toLowerCase().includes(q)
    const matchRole = roleFilter === "ALL" || n.userRole === roleFilter
    return matchSearch && matchRole
  }), [recent, search, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const donorCount    = recent.filter((n) => n.userRole === "DONOR").length
  const hospitalCount = recent.filter((n) => n.userRole === "HOSPITAL").length

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Broadcast Notifications</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Send targeted notifications to donors and hospitals across the network
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchRecent} disabled={loadingRecent} className="gap-2 self-start sm:self-auto">
          <RefreshCw className={`h-3.5 w-3.5 ${loadingRecent ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Sent", value: recent.length,  Icon: Bell,      color: "text-purple-600", bg: "bg-purple-50" },
          { label: "To Donors",  value: donorCount,     Icon: Users,     color: "text-red-600",    bg: "bg-red-50" },
          { label: "To Hospitals",value: hospitalCount, Icon: Building2, color: "text-blue-600",   bg: "bg-blue-50" },
        ].map(({ label, value, Icon, color, bg }) => (
          <Card key={label} className="border shadow-xs">
            <CardContent className="flex items-center gap-3 p-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} shrink-0`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">

        {/* ── COMPOSE PANEL ── */}
        <div className="lg:col-span-2 flex flex-col gap-4">

          {/* Quick templates */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Quick Templates</CardTitle>
              <CardDescription className="text-xs">Click to pre-fill the compose form</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pt-0">
              {QUICK_TEMPLATES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => { setTitle(t.title); setMessage(t.message); setTargetRole(t.role); setSentCount(null); setError("") }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${t.bg}`}
                >
                  <t.icon className={`h-4 w-4 shrink-0 ${t.color}`} />
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${t.color}`}>{t.label}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{t.title}</p>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Compose form */}
          <Card className="shadow-xs flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bell className="h-4 w-4 text-red-500" />Compose Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <FieldGroup>

                {/* Target audience toggle */}
                <Field>
                  <FieldLabel>Target Audience</FieldLabel>
                  <div className="grid grid-cols-2 gap-2">
                    {(["DONOR", "HOSPITAL"] as const).map((role) => (
                      <button key={role} onClick={() => setTargetRole(role)}
                        className={cn(
                          "flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                          targetRole === role
                            ? role === "DONOR" ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-background text-muted-foreground border-border hover:bg-muted/40"
                        )}>
                        {role === "DONOR" ? <Users className="h-3.5 w-3.5" /> : <Building2 className="h-3.5 w-3.5" />}
                        {role === "DONOR" ? "Donors" : "Hospitals"}
                      </button>
                    ))}
                  </div>
                </Field>

                {/* Blood group filter (donors only) */}
                {targetRole === "DONOR" && (
                  <Field>
                    <FieldLabel>Blood Group Filter</FieldLabel>
                    <Select value={bloodGroup} onValueChange={(v) => setBloodGroup(v ?? "ALL")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {BLOOD_GROUPS.map((bg) => (
                          <SelectItem key={bg.value} value={bg.value}>
                            {bg.value !== "ALL" && <span className="font-bold mr-1">{bg.label}</span>}
                            {bg.value === "ALL" && bg.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldDescription>Leave as "All" to reach every available donor</FieldDescription>
                  </Field>
                )}

                {/* Title */}
                <Field>
                  <FieldLabel htmlFor="notifTitle">
                    Title <span className="text-red-500">*</span>
                  </FieldLabel>
                  <Input id="notifTitle" placeholder="e.g. 🚨 Urgent: O− Blood Needed"
                    value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} />
                  <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
                </Field>

                {/* Message */}
                <Field>
                  <FieldLabel htmlFor="notifMsg">
                    Message <span className="text-red-500">*</span>
                  </FieldLabel>
                  <textarea id="notifMsg" rows={5}
                    placeholder="Write your broadcast message…"
                    value={message} onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
                  <p className="text-xs text-muted-foreground text-right">{message.length} chars</p>
                </Field>

                {/* Feedback */}
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />{error}
                  </div>
                )}
                {sentCount !== null && (
                  <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                    <span><strong>{sentCount}</strong> notification{sentCount !== 1 ? "s" : ""} sent successfully!</span>
                  </div>
                )}

                <Button onClick={handleSend} disabled={sending || !title.trim() || !message.trim()}
                  className={`w-full text-white gap-2 ${targetRole === "DONOR" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                  {sending ? <><Loader2 className="h-4 w-4 animate-spin" />Sending…</> : <><Send className="h-4 w-4" />Send to {targetRole === "DONOR" ? "Donors" : "Hospitals"}</>}
                </Button>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* ── BROADCAST HISTORY ── */}
        <Card className="lg:col-span-3 shadow-xs flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <CardTitle className="text-sm font-semibold">Broadcast History</CardTitle>
                <CardDescription className="text-xs mt-0.5">{recent.length} notifications sent</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground pointer-events-none" />
                  <Input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-7 h-8 w-36 text-xs" />
                </div>
                <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? "ALL")}>
                  <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All</SelectItem>
                    <SelectItem value="DONOR">Donors</SelectItem>
                    <SelectItem value="HOSPITAL">Hospitals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 flex-1">
            {loadingRecent ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading history…</p>
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2">
                <Bell className="h-10 w-10 text-muted-foreground/30" />
                <p className="text-sm font-medium text-muted-foreground">No notifications found</p>
                <p className="text-xs text-muted-foreground/70">
                  {recent.length === 0 ? "Send your first broadcast using the compose panel" : "Try adjusting your search or filter"}
                </p>
              </div>
            ) : (
              <ul className="divide-y">
                {paginated.map((n) => (
                  <li key={n.id} className="flex items-start gap-3 px-5 py-4 hover:bg-muted/30 transition-colors">
                    {/* Role icon */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                      n.userRole === "DONOR" ? "bg-red-100" : "bg-blue-100"}`}>
                      {n.userRole === "DONOR"
                        ? <Users className="h-3.5 w-3.5 text-red-600" />
                        : <Building2 className="h-3.5 w-3.5 text-blue-600" />}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold truncate">{n.title}</p>
                          <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0 shrink-0",
                            n.userRole === "DONOR"
                              ? "border-red-200 bg-red-50 text-red-600"
                              : "border-blue-200 bg-blue-50 text-blue-600"
                          )}>
                            {n.userRole === "DONOR" ? "Donors" : "Hospitals"}
                          </Badge>
                        </div>
                        <span className="text-[11px] text-muted-foreground shrink-0 flex items-center gap-1 mt-0.5">
                          <Clock className="h-2.5 w-2.5" />{timeAgo(n.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>

          {/* Pagination */}
          {!loadingRecent && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…")
                    acc.push(p); return acc
                  }, [])
                  .map((p, idx) => p === "…"
                    ? <span key={`e${idx}`} className="px-0.5 text-muted-foreground text-xs">…</span>
                    : <Button key={p} variant={page === p ? "default" : "outline"} size="icon"
                        className={`h-7 w-7 text-xs ${page === p ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : ""}`}
                        onClick={() => setPage(p as number)}>{p}</Button>
                  )}
                <Button variant="outline" size="icon" className="h-7 w-7" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
