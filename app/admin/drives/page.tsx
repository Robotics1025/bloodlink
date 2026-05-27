"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Plus, Trash2, Send, XCircle, Loader2, CalendarDays,
  MapPin, Clock, Users, Eye, Search, Filter, RefreshCw,
  ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle,
  FileEdit, Calendar,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

type DriveStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED"

interface BloodDrive {
  id: number
  title: string
  location: string
  date: string
  startTime: string
  endTime: string
  status: DriveStatus
  description: string | null
  _count: { appointments: number }
}

const STATUS_STYLE: Record<DriveStatus, string> = {
  DRAFT:     "border-gray-200 bg-gray-50 text-gray-600",
  PUBLISHED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-red-200 bg-red-50 text-red-600",
  COMPLETED: "border-blue-200 bg-blue-50 text-blue-700",
}
const STATUS_DOT: Record<DriveStatus, string> = {
  DRAFT:     "bg-gray-400",
  PUBLISHED: "bg-green-500",
  CANCELLED: "bg-red-500",
  COMPLETED: "bg-blue-500",
}

const PAGE_SIZE = 8

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })
}
function fmtDateLong(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
}
function isPast(d: string) { return new Date(d) < new Date() }

const BLANK_FORM = { title: "", location: "", date: "", startTime: "", endTime: "", description: "" }

type ConfirmAction = { drive: BloodDrive; action: "PUBLISH" | "CANCEL" | "COMPLETE" | "DELETE" }

export default function ManageDrivesPage() {
  const [drives, setDrives] = useState<BloodDrive[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [viewDrive, setViewDrive] = useState<BloodDrive | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState(BLANK_FORM)

  const fetchDrives = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/drives")
      setDrives(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDrives() }, [fetchDrives])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const filtered = useMemo(() => drives.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch = !q || d.title.toLowerCase().includes(q) || d.location.toLowerCase().includes(q)
    const matchStatus = statusFilter === "ALL" || d.status === statusFilter
    return matchSearch && matchStatus
  }), [drives, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const executeAction = async () => {
    if (!confirm) return
    setActionLoading(true)
    const { drive, action } = confirm
    try {
      if (action === "DELETE") {
        await fetch(`/api/admin/drives/${drive.id}`, { method: "DELETE" })
        setDrives((prev) => prev.filter((d) => d.id !== drive.id))
        setViewDrive(null)
      } else {
        const statusMap = { PUBLISH: "PUBLISHED", CANCEL: "CANCELLED", COMPLETE: "COMPLETED" } as const
        const newStatus = statusMap[action]
        await fetch(`/api/admin/drives/${drive.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        setDrives((prev) => prev.map((d) => d.id === drive.id ? { ...d, status: newStatus } : d))
        if (viewDrive?.id === drive.id) setViewDrive((v) => v ? { ...v, status: newStatus } : v)
      }
    } finally { setActionLoading(false); setConfirm(null) }
  }

  const handleCreate = async () => {
    if (!form.title || !form.location || !form.date || !form.startTime || !form.endTime) {
      setError("Please fill in all required fields."); return
    }
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/drives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      await fetchDrives()
      setCreateOpen(false)
      setForm(BLANK_FORM)
    } finally { setSaving(false) }
  }

  const published  = drives.filter((d) => d.status === "PUBLISHED").length
  const draft      = drives.filter((d) => d.status === "DRAFT").length
  const completed  = drives.filter((d) => d.status === "COMPLETED").length
  const totalSlots = drives.reduce((s, d) => s + d._count.appointments, 0)

  // Available next actions per status
  function nextActions(d: BloodDrive): ConfirmAction["action"][] {
    if (d.status === "DRAFT")      return ["PUBLISH", "DELETE"]
    if (d.status === "PUBLISHED")  return ["COMPLETE", "CANCEL", "DELETE"]
    if (d.status === "CANCELLED")  return ["DELETE"]
    return ["DELETE"]
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blood Drives</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Schedule and manage community blood donation drives</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={fetchDrives} disabled={loading} className="gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-2"
            onClick={() => { setCreateOpen(true); setError(""); setForm(BLANK_FORM) }}>
            <Plus className="h-3.5 w-3.5" />Create Drive
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Drives",   value: drives.length, Icon: CalendarDays, color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Published",      value: published,     Icon: Send,         color: "text-green-600",  bg: "bg-green-50" },
          { label: "Drafts",         value: draft,         Icon: FileEdit,     color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "Total Bookings", value: totalSlots,    Icon: Users,        color: "text-purple-600", bg: "bg-purple-50" },
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

      {/* Table card */}
      <Card className="shadow-xs">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search title or location…" value={search}
                onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
                <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {(search || statusFilter !== "ALL") && (
                <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground"
                  onClick={() => { setSearch(""); setStatusFilter("ALL") }}>Clear</Button>
              )}
              <span className="text-xs text-muted-foreground">{filtered.length} of {drives.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6 text-xs">Drive</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Time</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Bookings</TableHead>
                  <TableHead className="text-xs pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="py-16 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading drives…</p>
                  </TableCell></TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-16 text-center">
                    <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No blood drives found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Create one to get started</p>
                  </TableCell></TableRow>
                ) : paginated.map((drive) => (
                  <TableRow key={drive.id} className={drive.status === "CANCELLED" ? "opacity-60" : ""}>
                    {/* Title + location */}
                    <TableCell className="pl-6">
                      <div className="flex items-start gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                          drive.status === "PUBLISHED" ? "bg-green-100" :
                          drive.status === "COMPLETED" ? "bg-blue-100" :
                          drive.status === "CANCELLED" ? "bg-red-100" : "bg-gray-100"}`}>
                          <CalendarDays className={`h-4 w-4 ${
                            drive.status === "PUBLISHED" ? "text-green-600" :
                            drive.status === "COMPLETED" ? "text-blue-600" :
                            drive.status === "CANCELLED" ? "text-red-500" : "text-gray-500"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate max-w-[180px]">{drive.title}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate max-w-[160px]">{drive.location}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 shrink-0" />
                        <span className={isPast(drive.date) && drive.status === "PUBLISHED" ? "text-orange-500 font-medium" : ""}>
                          {fmtDate(drive.date)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Time */}
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 shrink-0" />
                        {drive.startTime} – {drive.endTime}
                      </div>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <Badge variant="outline" className={STATUS_STYLE[drive.status]}>
                        <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${STATUS_DOT[drive.status]}`} />
                        {drive.status}
                      </Badge>
                    </TableCell>

                    {/* Bookings */}
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-semibold">{drive._count.appointments}</span>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-6">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => setViewDrive(drive)} title="View details">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {drive.status === "DRAFT" && (
                          <Button variant="outline" size="icon" className="h-8 w-8 border-green-200 text-green-600 hover:bg-green-50"
                            onClick={() => setConfirm({ drive, action: "PUBLISH" })} title="Publish">
                            <Send className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {drive.status === "PUBLISHED" && (
                          <Button variant="outline" size="icon" className="h-8 w-8 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => setConfirm({ drive, action: "COMPLETE" })} title="Mark complete">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {drive.status === "PUBLISHED" && (
                          <Button variant="outline" size="icon" className="h-8 w-8 border-orange-200 text-orange-500 hover:bg-orange-50"
                            onClick={() => setConfirm({ drive, action: "CANCEL" })} title="Cancel drive">
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => setConfirm({ drive, action: "DELETE" })} title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…")
                    acc.push(p); return acc
                  }, [])
                  .map((p, idx) => p === "…"
                    ? <span key={`e${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                    : <Button key={p} variant={page === p ? "default" : "outline"} size="icon"
                        className={`h-8 w-8 text-xs ${page === p ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : ""}`}
                        onClick={() => setPage(p as number)}>{p}</Button>
                  )}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Sheet ── */}
      <Sheet open={!!viewDrive} onOpenChange={() => setViewDrive(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {viewDrive && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle>Drive Details</SheetTitle>
                <SheetDescription>Full details for this blood drive</SheetDescription>
              </SheetHeader>

              {/* Hero banner */}
              <div className={`flex flex-col items-center gap-2 py-6 rounded-xl mb-5 ${
                viewDrive.status === "PUBLISHED" ? "bg-green-50" :
                viewDrive.status === "COMPLETED" ? "bg-blue-50" :
                viewDrive.status === "CANCELLED" ? "bg-red-50" : "bg-muted/40"}`}>
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                  viewDrive.status === "PUBLISHED" ? "bg-green-100" :
                  viewDrive.status === "COMPLETED" ? "bg-blue-100" :
                  viewDrive.status === "CANCELLED" ? "bg-red-100" : "bg-gray-100"}`}>
                  <CalendarDays className={`h-8 w-8 ${
                    viewDrive.status === "PUBLISHED" ? "text-green-600" :
                    viewDrive.status === "COMPLETED" ? "text-blue-600" :
                    viewDrive.status === "CANCELLED" ? "text-red-500" : "text-gray-500"}`} />
                </div>
                <div className="text-center px-4">
                  <h2 className="text-base font-bold">{viewDrive.title}</h2>
                </div>
                <Badge variant="outline" className={STATUS_STYLE[viewDrive.status]}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${STATUS_DOT[viewDrive.status]}`} />
                  {viewDrive.status}
                </Badge>
              </div>

              {/* Info rows */}
              <div className="space-y-3 mb-6">
                {[
                  { icon: MapPin,   label: "Location",     value: viewDrive.location },
                  { icon: Calendar, label: "Date",         value: fmtDateLong(viewDrive.date) },
                  { icon: Clock,    label: "Time",         value: `${viewDrive.startTime} – ${viewDrive.endTime}` },
                  { icon: Users,    label: "Bookings",     value: `${viewDrive._count.appointments} appointment${viewDrive._count.appointments !== 1 ? "s" : ""}` },
                ].map(({ icon: Ic, label, value }) => (
                  <div key={label} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/30">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border">
                      <Ic className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="text-sm font-medium">{value}</p>
                    </div>
                  </div>
                ))}
                {viewDrive.description && (
                  <div className="px-4 py-3 rounded-lg bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{viewDrive.description}</p>
                  </div>
                )}
              </div>

              <Separator className="mb-5" />

              {/* Actions */}
              <div className="flex flex-col gap-2">
                {viewDrive.status === "DRAFT" && (
                  <Button className="bg-green-600 hover:bg-green-700 text-white gap-2"
                    onClick={() => { setConfirm({ drive: viewDrive, action: "PUBLISH" }); setViewDrive(null) }}>
                    <Send className="h-4 w-4" />Publish Drive
                  </Button>
                )}
                {viewDrive.status === "PUBLISHED" && (
                  <>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                      onClick={() => { setConfirm({ drive: viewDrive, action: "COMPLETE" }); setViewDrive(null) }}>
                      <CheckCircle2 className="h-4 w-4" />Mark as Completed
                    </Button>
                    <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50 gap-2"
                      onClick={() => { setConfirm({ drive: viewDrive, action: "CANCEL" }); setViewDrive(null) }}>
                      <XCircle className="h-4 w-4" />Cancel Drive
                    </Button>
                  </>
                )}
                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                  onClick={() => { setConfirm({ drive: viewDrive, action: "DELETE" }); setViewDrive(null) }}>
                  <Trash2 className="h-4 w-4" />Delete Drive
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ── Action Confirm Dialog ── */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="max-w-sm">
          {confirm && (() => {
            const { drive, action } = confirm
            const cfg = {
              PUBLISH:  { icon: Send,         bg: "bg-green-100",  iconCls: "text-green-600",  title: "Publish Drive",      desc: "The drive will be publicly visible and open for bookings.", btnCls: "bg-green-600 hover:bg-green-700", label: "Yes, Publish" },
              COMPLETE: { icon: CheckCircle2, bg: "bg-blue-100",   iconCls: "text-blue-600",   title: "Mark as Completed",  desc: "The drive will be marked as completed and closed for new bookings.", btnCls: "bg-blue-600 hover:bg-blue-700",  label: "Yes, Complete" },
              CANCEL:   { icon: XCircle,      bg: "bg-orange-100", iconCls: "text-orange-600", title: "Cancel Drive",       desc: "The drive will be cancelled. All pending appointments will be notified.", btnCls: "bg-orange-600 hover:bg-orange-700", label: "Yes, Cancel" },
              DELETE:   { icon: AlertTriangle,bg: "bg-red-100",    iconCls: "text-red-600",    title: "Delete Drive",       desc: "This action is permanent. All associated appointments will be removed.", btnCls: "bg-red-600 hover:bg-red-700",   label: "Delete Permanently" },
            }[action]
            const Ic = cfg.icon
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${cfg.bg}`}>
                      <Ic className={`h-4 w-4 ${cfg.iconCls}`} />
                    </div>
                    {cfg.title}
                  </DialogTitle>
                  <DialogDescription>{cfg.desc}</DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border bg-muted/40 px-4 py-3">
                  <p className="text-sm font-medium">{drive.title}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3" />{drive.location} · {fmtDate(drive.date)}
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
                  <Button onClick={executeAction} disabled={actionLoading} className={`text-white gap-2 ${cfg.btnCls}`}>
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {cfg.label}
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Create Drive Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <CalendarDays className="h-4 w-4 text-red-600" />
              </div>
              Create Blood Drive
            </DialogTitle>
            <DialogDescription>Fill in the details. New drives start as Draft — publish when ready.</DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="driveTitle">Title <span className="text-red-500">*</span></FieldLabel>
              <Input id="driveTitle" placeholder="Community Blood Drive 2026"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="driveLocation">Location <span className="text-red-500">*</span></FieldLabel>
              <Input id="driveLocation" placeholder="Uhuru Park, Nairobi"
                value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            </Field>
            <Field>
              <FieldLabel htmlFor="driveDate">Date <span className="text-red-500">*</span></FieldLabel>
              <Input id="driveDate" type="date"
                value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="startTime">Start Time <span className="text-red-500">*</span></FieldLabel>
                <Input id="startTime" type="time"
                  value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
              </Field>
              <Field>
                <FieldLabel htmlFor="endTime">End Time <span className="text-red-500">*</span></FieldLabel>
                <Input id="endTime" type="time"
                  value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="driveDesc">Description <span className="text-muted-foreground font-normal">(optional)</span></FieldLabel>
              <textarea id="driveDesc" rows={3}
                placeholder="Describe the blood drive, what to expect, any requirements…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
            </Field>
            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />{error}
              </p>
            )}
          </FieldGroup>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Create Drive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
