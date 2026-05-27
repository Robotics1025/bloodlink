"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Search, Trash2, CheckCircle, XCircle, Loader2,
  Building2, Clock, Filter, RefreshCw, Eye,
  MapPin, Mail, Phone, FileText, Calendar,
  ChevronLeft, ChevronRight, AlertTriangle, ShieldCheck,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type HospitalStatus = "PENDING" | "APPROVED" | "DISABLED"

interface Hospital {
  id: number
  hospitalName: string
  email: string
  phone: string
  location: string
  licenseNumber: string
  status: HospitalStatus
  createdAt: string
}

const STATUS_STYLE: Record<HospitalStatus, string> = {
  PENDING:  "border-yellow-200 bg-yellow-50 text-yellow-700",
  APPROVED: "border-green-200 bg-green-50 text-green-700",
  DISABLED: "border-gray-200 bg-gray-50 text-gray-500",
}
const STATUS_DOT: Record<HospitalStatus, string> = {
  PENDING:  "bg-yellow-400",
  APPROVED: "bg-green-500",
  DISABLED: "bg-gray-400",
}

const AVATAR_COLORS = [
  "bg-blue-500","bg-teal-500","bg-indigo-500","bg-cyan-500",
  "bg-sky-500","bg-violet-500","bg-emerald-500","bg-slate-500",
]

const PAGE_SIZE = 10

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function fmtDateLong(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

type ConfirmAction = { hospital: Hospital; action: "APPROVE" | "DISABLE" | "ENABLE" | "DELETE" }

export default function ManageHospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [viewHospital, setViewHospital] = useState<Hospital | null>(null)
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchHospitals = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/hospitals")
      setHospitals(await res.json())
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchHospitals() }, [fetchHospitals])
  useEffect(() => { setPage(1) }, [search, statusFilter])

  const filtered = useMemo(() => hospitals.filter((h) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      h.hospitalName.toLowerCase().includes(q) ||
      h.email.toLowerCase().includes(q) ||
      h.location.toLowerCase().includes(q) ||
      h.licenseNumber.toLowerCase().includes(q)
    const matchStatus = statusFilter === "ALL" || h.status === statusFilter
    return matchSearch && matchStatus
  }), [hospitals, search, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const executeAction = async () => {
    if (!confirm) return
    setActionLoading(true)
    const { hospital, action } = confirm
    try {
      if (action === "DELETE") {
        await fetch(`/api/admin/hospitals/${hospital.id}`, { method: "DELETE" })
        setHospitals((prev) => prev.filter((h) => h.id !== hospital.id))
        setViewHospital(null)
      } else {
        const statusMap = { APPROVE: "APPROVED", DISABLE: "DISABLED", ENABLE: "APPROVED" } as const
        const newStatus = statusMap[action]
        await fetch(`/api/admin/hospitals/${hospital.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        })
        setHospitals((prev) => prev.map((h) => h.id === hospital.id ? { ...h, status: newStatus } : h))
        if (viewHospital?.id === hospital.id) setViewHospital((v) => v ? { ...v, status: newStatus } : v)
      }
    } finally {
      setActionLoading(false)
      setConfirm(null)
    }
  }

  const pending  = hospitals.filter((h) => h.status === "PENDING").length
  const approved = hospitals.filter((h) => h.status === "APPROVED").length
  const disabled = hospitals.filter((h) => h.status === "DISABLED").length

  const actionLabel = (h: Hospital) => {
    if (h.status === "PENDING")  return { label: "Approve", action: "APPROVE" as const, cls: "border-green-200 text-green-700 hover:bg-green-50", Icon: CheckCircle }
    if (h.status === "APPROVED") return { label: "Disable", action: "DISABLE" as const, cls: "border-orange-200 text-orange-600 hover:bg-orange-50", Icon: XCircle }
    return { label: "Enable", action: "ENABLE" as const, cls: "border-green-200 text-green-700 hover:bg-green-50", Icon: CheckCircle }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Hospitals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Review, approve, disable, or remove hospital registrations</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchHospitals} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total",    value: hospitals.length, color: "text-blue-600",   bg: "bg-blue-50",   Icon: Building2 },
          { label: "Approved", value: approved,         color: "text-green-600",  bg: "bg-green-50",  Icon: ShieldCheck },
          { label: "Pending",  value: pending,          color: "text-yellow-600", bg: "bg-yellow-50", Icon: Clock },
          { label: "Disabled", value: disabled,         color: "text-gray-500",   bg: "bg-gray-100",  Icon: XCircle },
        ].map(({ label, value, color, bg, Icon }) => (
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
              <Input placeholder="Search name, email, location, license…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
                <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="DISABLED">Disabled</SelectItem>
                </SelectContent>
              </Select>
              {(search || statusFilter !== "ALL") && (
                <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground"
                  onClick={() => { setSearch(""); setStatusFilter("ALL") }}>Clear</Button>
              )}
              <span className="text-xs text-muted-foreground">{filtered.length} of {hospitals.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6 text-xs w-[240px]">Hospital</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Location</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">License</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Registered</TableHead>
                  <TableHead className="text-xs pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-16 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading hospitals…</p>
                  </TableCell></TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-16 text-center">
                    <Building2 className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No hospitals found</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting filters</p>
                  </TableCell></TableRow>
                ) : paginated.map((h, i) => {
                  const colorIdx = hospitals.findIndex((x) => x.id === h.id) % AVATAR_COLORS.length
                  const { label, action, cls, Icon } = actionLabel(h)
                  return (
                    <TableRow key={h.id}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className={`${AVATAR_COLORS[colorIdx]} text-white text-xs font-bold`}>
                              {initials(h.hospitalName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{h.hospitalName}</p>
                            <p className="text-xs text-muted-foreground truncate">{h.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-[160px]">
                          <MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{h.location}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs font-mono text-muted-foreground">{h.licenseNumber}</TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{h.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={STATUS_STYLE[h.status]}>
                          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${STATUS_DOT[h.status]}`} />
                          {h.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{fmtDate(h.createdAt)}</TableCell>
                      <TableCell className="pr-6">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setViewHospital(h)} title="View details"><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="outline" size="icon" className={`h-8 w-8 ${cls}`}
                            onClick={() => setConfirm({ hospital: h, action })} title={label}>
                            <Icon className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => setConfirm({ hospital: h, action: "DELETE" })} title="Delete">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
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
      <Sheet open={!!viewHospital} onOpenChange={() => setViewHospital(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {viewHospital && (() => {
            const colorIdx = hospitals.findIndex((x) => x.id === viewHospital.id) % AVATAR_COLORS.length
            const { label, action, Icon } = actionLabel(viewHospital)
            return (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle>Hospital Details</SheetTitle>
                  <SheetDescription>Full profile for this registered hospital</SheetDescription>
                </SheetHeader>
                <div className="flex flex-col items-center gap-3 py-6 bg-muted/30 rounded-xl mb-5">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className={`${AVATAR_COLORS[colorIdx]} text-white text-2xl font-bold`}>
                      {initials(viewHospital.hospitalName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-lg font-bold">{viewHospital.hospitalName}</h2>
                    <p className="text-sm text-muted-foreground">{viewHospital.email}</p>
                  </div>
                  <Badge variant="outline" className={STATUS_STYLE[viewHospital.status]}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${STATUS_DOT[viewHospital.status]}`} />
                    {viewHospital.status}
                  </Badge>
                </div>
                <div className="space-y-3 mb-6">
                  {[
                    { icon: Mail,     label: "Email",        value: viewHospital.email },
                    { icon: Phone,    label: "Phone",        value: viewHospital.phone },
                    { icon: MapPin,   label: "Location",     value: viewHospital.location },
                    { icon: FileText, label: "License No.",  value: viewHospital.licenseNumber },
                    { icon: Calendar, label: "Registered",   value: fmtDateLong(viewHospital.createdAt) },
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
                </div>
                <Separator className="mb-5" />
                <div className="flex flex-col gap-2">
                  <Button variant="outline"
                    className={viewHospital.status === "APPROVED"
                      ? "border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
                      : "border-green-200 text-green-700 hover:bg-green-50 gap-2"}
                    onClick={() => { setConfirm({ hospital: viewHospital, action }); setViewHospital(null) }}>
                    <Icon className="h-4 w-4" />{label} Hospital
                  </Button>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                    onClick={() => { setConfirm({ hospital: viewHospital, action: "DELETE" }); setViewHospital(null) }}>
                    <Trash2 className="h-4 w-4" />Delete Hospital
                  </Button>
                </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* ── Confirm Dialog ── */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="max-w-sm">
          {confirm && (() => {
            const isDelete  = confirm.action === "DELETE"
            const isApprove = confirm.action === "APPROVE" || confirm.action === "ENABLE"
            const isDisable = confirm.action === "DISABLE"
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${isDelete ? "bg-red-100" : isApprove ? "bg-green-100" : "bg-orange-100"}`}>
                      {isDelete  ? <AlertTriangle className="h-4 w-4 text-red-600" /> :
                       isApprove ? <CheckCircle   className="h-4 w-4 text-green-600" /> :
                                   <XCircle       className="h-4 w-4 text-orange-600" />}
                    </div>
                    {isDelete ? "Delete Hospital" : isApprove ? "Approve Hospital" : "Disable Hospital"}
                  </DialogTitle>
                  <DialogDescription>
                    {isDelete  ? "This action is permanent and cannot be undone." :
                     isApprove ? "The hospital will be able to post blood requests and manage inventory." :
                                 "The hospital will lose access to the platform until re-enabled."}
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg border bg-muted/40 px-4 py-3">
                  <p className="text-sm font-medium">{confirm.hospital.hospitalName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{confirm.hospital.email}</p>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
                  <Button onClick={executeAction} disabled={actionLoading}
                    className={`gap-2 text-white ${isDelete ? "bg-red-600 hover:bg-red-700" : isApprove ? "bg-green-600 hover:bg-green-700" : "bg-orange-600 hover:bg-orange-700"}`}>
                    {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {isDelete ? "Delete" : isApprove ? "Yes, Approve" : "Yes, Disable"}
                  </Button>
                </DialogFooter>
              </>
            )
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
