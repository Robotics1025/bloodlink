"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Search, Trash2, UserCheck, UserX, Loader2,
  Users, Heart, MapPin, Droplet, Filter, RefreshCw,
  Eye, ChevronLeft, ChevronRight, Phone, Mail,
  Calendar, Clock, AlertTriangle,
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

interface Donor {
  id: number
  fullName: string
  email: string
  phone: string
  bloodGroup: string
  location: string
  availabilityStatus: "AVAILABLE" | "UNAVAILABLE"
  lastDonationDate: string | null
  createdAt: string
}

const BG_LABEL: Record<string, string> = {
  A_POS: "A+", A_NEG: "A−", B_POS: "B+", B_NEG: "B−",
  AB_POS: "AB+", AB_NEG: "AB−", O_POS: "O+", O_NEG: "O−",
}
const BG_COLORS: Record<string, string> = {
  O_NEG: "bg-red-100 text-red-700", O_POS: "bg-red-100 text-red-700",
  A_NEG: "bg-blue-100 text-blue-700", A_POS: "bg-blue-100 text-blue-700",
  B_NEG: "bg-orange-100 text-orange-700", B_POS: "bg-orange-100 text-orange-700",
  AB_NEG: "bg-purple-100 text-purple-700", AB_POS: "bg-purple-100 text-purple-700",
}
const AVATAR_COLORS = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-orange-500",
  "bg-teal-500", "bg-indigo-500", "bg-pink-500", "bg-amber-500",
]

const PAGE_SIZE = 10

function fmtDate(d: string | null) {
  if (!d) return "Never"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
}
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

export default function ManageDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [bloodFilter, setBloodFilter] = useState("ALL")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(1)

  // Dialogs / sheets
  const [viewDonor, setViewDonor] = useState<Donor | null>(null)
  const [confirmToggle, setConfirmToggle] = useState<Donor | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<Donor | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [togglingId, setTogglingId] = useState<number | null>(null)

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/donors")
      const data = await res.json()
      setDonors(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDonors() }, [fetchDonors])

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1) }, [search, bloodFilter, statusFilter])

  const filtered = useMemo(() => donors.filter((d) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      d.fullName.toLowerCase().includes(q) ||
      d.email.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q) ||
      (BG_LABEL[d.bloodGroup] ?? "").toLowerCase().includes(q)
    const matchBlood = bloodFilter === "ALL" || d.bloodGroup === bloodFilter
    const matchStatus = statusFilter === "ALL" || d.availabilityStatus === statusFilter
    return matchSearch && matchBlood && matchStatus
  }), [donors, search, bloodFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const confirmAndToggle = async () => {
    if (!confirmToggle) return
    setTogglingId(confirmToggle.id)
    const newStatus = confirmToggle.availabilityStatus === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE"
    try {
      await fetch(`/api/admin/donors/${confirmToggle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      setDonors((prev) => prev.map((d) =>
        d.id === confirmToggle.id ? { ...d, availabilityStatus: newStatus } : d
      ))
      // update the detail sheet if open
      if (viewDonor?.id === confirmToggle.id)
        setViewDonor((v) => v ? { ...v, availabilityStatus: newStatus } : v)
    } finally {
      setTogglingId(null)
      setConfirmToggle(null)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    try {
      await fetch(`/api/admin/donors/${confirmDelete.id}`, { method: "DELETE" })
      setDonors((prev) => prev.filter((d) => d.id !== confirmDelete.id))
      setConfirmDelete(null)
      setViewDonor(null)
    } finally {
      setDeletingId(null)
    }
  }

  const available = donors.filter((d) => d.availabilityStatus === "AVAILABLE").length
  const bloodGroups = [...new Set(donors.map((d) => d.bloodGroup))].sort()

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* ── Page heading ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Donors</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            View, activate, deactivate, or remove registered blood donors
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchDonors} disabled={loading} className="gap-2 self-start sm:self-auto">
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Donors", value: donors.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Available", value: available, icon: Heart, color: "text-green-600", bg: "bg-green-50" },
          { label: "Unavailable", value: donors.length - available, icon: UserX, color: "text-red-600", bg: "bg-red-50" },
          { label: "Blood Groups", value: bloodGroups.length, icon: Droplet, color: "text-orange-600", bg: "bg-orange-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
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

      {/* ── Table card ── */}
      <Card className="shadow-xs">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search name, email, location…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={bloodFilter} onValueChange={(v) => setBloodFilter(v ?? "ALL")}>
                <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="Blood group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Groups</SelectItem>
                  {Object.entries(BG_LABEL).map(([val, lbl]) => (
                    <SelectItem key={val} value={val}>{lbl}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "ALL")}>
                <SelectTrigger className="h-9 w-32 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="UNAVAILABLE">Unavailable</SelectItem>
                </SelectContent>
              </Select>
              {(search || bloodFilter !== "ALL" || statusFilter !== "ALL") && (
                <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground"
                  onClick={() => { setSearch(""); setBloodFilter("ALL"); setStatusFilter("ALL") }}>
                  Clear
                </Button>
              )}
              <span className="text-xs text-muted-foreground ml-1">{filtered.length} of {donors.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6 text-xs w-[220px]">Donor</TableHead>
                  <TableHead className="text-xs">Blood</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">Location</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Phone</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Last Donation</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Joined</TableHead>
                  <TableHead className="text-xs pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Loading donors…</p>
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center">
                      <Users className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm font-medium text-muted-foreground">No donors found</p>
                      <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting your search or filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((donor, i) => {
                    const colorIdx = donors.findIndex((d) => d.id === donor.id) % AVATAR_COLORS.length
                    return (
                      <TableRow key={donor.id} className="group">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 shrink-0">
                              <AvatarFallback className={`${AVATAR_COLORS[colorIdx]} text-white text-xs font-bold`}>
                                {initials(donor.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{donor.fullName}</p>
                              <p className="text-xs text-muted-foreground truncate">{donor.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${BG_COLORS[donor.bloodGroup] ?? "bg-gray-100 text-gray-700"}`}>
                            {BG_LABEL[donor.bloodGroup] ?? donor.bloodGroup}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground max-w-[160px]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{donor.location}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{donor.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={donor.availabilityStatus === "AVAILABLE"
                            ? "border-green-200 bg-green-50 text-green-700"
                            : "border-gray-200 bg-gray-50 text-gray-500"}>
                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${donor.availabilityStatus === "AVAILABLE" ? "bg-green-500" : "bg-gray-400"}`} />
                            {donor.availabilityStatus === "AVAILABLE" ? "Available" : "Unavailable"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{fmtDate(donor.lastDonationDate)}</TableCell>
                        <TableCell className="hidden sm:table-cell text-xs text-muted-foreground">{fmtDate(donor.createdAt)}</TableCell>
                        <TableCell className="pr-6">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View details */}
                            <Button variant="outline" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => setViewDonor(donor)} title="View details">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                            {/* Toggle status */}
                            <Button variant="outline" size="icon"
                              disabled={togglingId === donor.id}
                              className={`h-8 w-8 ${donor.availabilityStatus === "AVAILABLE"
                                ? "border-orange-200 text-orange-600 hover:bg-orange-50"
                                : "border-green-200 text-green-600 hover:bg-green-50"}`}
                              onClick={() => setConfirmToggle(donor)}
                              title={donor.availabilityStatus === "AVAILABLE" ? "Deactivate" : "Activate"}>
                              {togglingId === donor.id
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : donor.availabilityStatus === "AVAILABLE"
                                  ? <UserX className="h-3.5 w-3.5" />
                                  : <UserCheck className="h-3.5 w-3.5" />}
                            </Button>
                            {/* Delete */}
                            <Button variant="outline" size="icon"
                              className="h-8 w-8 border-red-200 text-red-600 hover:bg-red-50"
                              onClick={() => setConfirmDelete(donor)} title="Delete donor">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/20">
              <p className="text-xs text-muted-foreground">
                Showing <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="font-medium">{filtered.length}</span> donors
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "…")[]>((acc, p, idx, arr) => {
                    if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("…")
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">…</span>
                    ) : (
                      <Button key={p} variant={page === p ? "default" : "outline"} size="icon"
                        className={`h-8 w-8 text-xs ${page === p ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : ""}`}
                        onClick={() => setPage(p as number)}>
                        {p}
                      </Button>
                    )
                  )}
                <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ════════════════════════════════════
          DONOR DETAIL SHEET (slide-over)
      ════════════════════════════════════ */}
      <Sheet open={!!viewDonor} onOpenChange={() => setViewDonor(null)}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          {viewDonor && (() => {
            const colorIdx = donors.findIndex((d) => d.id === viewDonor.id) % AVATAR_COLORS.length
            return (
              <>
                <SheetHeader className="pb-4">
                  <SheetTitle>Donor Details</SheetTitle>
                  <SheetDescription>Full profile for this registered donor</SheetDescription>
                </SheetHeader>

                {/* Avatar + name block */}
                <div className="flex flex-col items-center gap-3 py-6 bg-muted/30 rounded-xl mb-5">
                  <Avatar className="h-20 w-20">
                    <AvatarFallback className={`${AVATAR_COLORS[colorIdx]} text-white text-2xl font-bold`}>
                      {initials(viewDonor.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h2 className="text-lg font-bold">{viewDonor.fullName}</h2>
                    <p className="text-sm text-muted-foreground">{viewDonor.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${BG_COLORS[viewDonor.bloodGroup] ?? "bg-gray-100 text-gray-700"}`}>
                      <Droplet className="h-3.5 w-3.5 mr-1" />{BG_LABEL[viewDonor.bloodGroup] ?? viewDonor.bloodGroup}
                    </span>
                    <Badge variant="outline" className={viewDonor.availabilityStatus === "AVAILABLE"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-gray-200 bg-gray-50 text-gray-500"}>
                      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full inline-block ${viewDonor.availabilityStatus === "AVAILABLE" ? "bg-green-500" : "bg-gray-400"}`} />
                      {viewDonor.availabilityStatus === "AVAILABLE" ? "Available" : "Unavailable"}
                    </Badge>
                  </div>
                </div>

                {/* Info rows */}
                <div className="space-y-3 mb-6">
                  {[
                    { icon: Mail, label: "Email", value: viewDonor.email },
                    { icon: Phone, label: "Phone", value: viewDonor.phone },
                    { icon: MapPin, label: "Location", value: viewDonor.location },
                    { icon: Calendar, label: "Joined", value: fmtDateTime(viewDonor.createdAt) },
                    { icon: Clock, label: "Last Donation", value: fmtDate(viewDonor.lastDonationDate) },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/30">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background border">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator className="mb-5" />

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => { setConfirmToggle(viewDonor); setViewDonor(null) }}
                    variant="outline"
                    className={viewDonor.availabilityStatus === "AVAILABLE"
                      ? "border-orange-200 text-orange-700 hover:bg-orange-50 gap-2"
                      : "border-green-200 text-green-700 hover:bg-green-50 gap-2"}
                  >
                    {viewDonor.availabilityStatus === "AVAILABLE"
                      ? <><UserX className="h-4 w-4" />Deactivate Donor</>
                      : <><UserCheck className="h-4 w-4" />Activate Donor</>}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 gap-2"
                    onClick={() => { setConfirmDelete(viewDonor); setViewDonor(null) }}
                  >
                    <Trash2 className="h-4 w-4" />Delete Donor
                  </Button>
                </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>

      {/* ════════════════════════════════════
          TOGGLE STATUS CONFIRMATION
      ════════════════════════════════════ */}
      <Dialog open={!!confirmToggle} onOpenChange={() => setConfirmToggle(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`flex h-9 w-9 items-center justify-center rounded-full ${confirmToggle?.availabilityStatus === "AVAILABLE" ? "bg-orange-100" : "bg-green-100"}`}>
                {confirmToggle?.availabilityStatus === "AVAILABLE"
                  ? <UserX className="h-4 w-4 text-orange-600" />
                  : <UserCheck className="h-4 w-4 text-green-600" />}
              </div>
              {confirmToggle?.availabilityStatus === "AVAILABLE" ? "Deactivate Donor" : "Activate Donor"}
            </DialogTitle>
            <DialogDescription>
              {confirmToggle?.availabilityStatus === "AVAILABLE"
                ? "This donor will no longer appear in emergency alerts or be contactable for requests."
                : "This donor will be visible to hospitals and receive emergency blood request alerts."}
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 px-4 py-3">
            <p className="text-sm font-medium">{confirmToggle?.fullName}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{confirmToggle?.email}</p>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmToggle(null)}>Cancel</Button>
            <Button
              onClick={confirmAndToggle}
              disabled={togglingId !== null}
              className={confirmToggle?.availabilityStatus === "AVAILABLE"
                ? "bg-orange-600 hover:bg-orange-700 text-white gap-2"
                : "bg-green-600 hover:bg-green-700 text-white gap-2"}
            >
              {togglingId !== null && <Loader2 className="h-4 w-4 animate-spin" />}
              {confirmToggle?.availabilityStatus === "AVAILABLE" ? "Yes, Deactivate" : "Yes, Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════════════════════════════════════
          DELETE CONFIRMATION
      ════════════════════════════════════ */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              Delete Donor
            </DialogTitle>
            <DialogDescription>This action is permanent and cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <p className="font-medium">{confirmDelete?.fullName}</p>
            <p className="text-muted-foreground text-xs mt-0.5">{confirmDelete?.email}</p>
          </div>
          <p className="text-sm text-muted-foreground">
            All donor data including donation history, appointments, and notifications will be permanently removed.
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
            <Button onClick={handleDelete} disabled={deletingId !== null}
              className="bg-red-600 hover:bg-red-700 text-white gap-2">
              {deletingId !== null && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
