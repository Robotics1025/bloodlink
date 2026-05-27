"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  Search, Pencil, Loader2, AlertTriangle, Package,
  Plus, Filter, RefreshCw, ChevronLeft, ChevronRight,
  Droplet, TrendingDown, CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

const BLOOD_GROUPS = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"] as const
type BloodGroup = typeof BLOOD_GROUPS[number]

const BG_LABEL: Record<string, string> = {
  A_POS:"A+",A_NEG:"A−",B_POS:"B+",B_NEG:"B−",AB_POS:"AB+",AB_NEG:"AB−",O_POS:"O+",O_NEG:"O−",
}
const BG_COLORS: Record<string, string> = {
  O_NEG:"bg-red-100 text-red-700",O_POS:"bg-red-100 text-red-700",
  A_NEG:"bg-blue-100 text-blue-700",A_POS:"bg-blue-100 text-blue-700",
  B_NEG:"bg-orange-100 text-orange-700",B_POS:"bg-orange-100 text-orange-700",
  AB_NEG:"bg-purple-100 text-purple-700",AB_POS:"bg-purple-100 text-purple-700",
}

const PAGE_SIZE = 12

function stockInfo(units: number) {
  if (units === 0)  return { label: "Out of Stock", cls: "border-red-200 bg-red-50 text-red-700",     bar: "bg-red-500",    pct: 0 }
  if (units <= 5)   return { label: "Low Stock",    cls: "border-orange-200 bg-orange-50 text-orange-700", bar: "bg-orange-500", pct: Math.round((units / 30) * 100) }
  if (units <= 20)  return { label: "Moderate",     cls: "border-yellow-200 bg-yellow-50 text-yellow-700", bar: "bg-yellow-500", pct: Math.round((units / 30) * 100) }
  return               { label: "Good",         cls: "border-green-200 bg-green-50 text-green-700",   bar: "bg-green-500",  pct: Math.min(100, Math.round((units / 50) * 100)) }
}

function fmtDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

interface InventoryItem {
  id: number
  bloodGroup: BloodGroup
  availableUnits: number
  lastUpdated: string
}

export default function ManageInventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [bloodFilter, setBloodFilter] = useState("ALL")
  const [stockFilter, setStockFilter] = useState("ALL")
  const [page, setPage] = useState(1)
  const [editItem, setEditItem] = useState<InventoryItem | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  // Edit form
  const [editUnits, setEditUnits] = useState("")
  // Add form
  const [addBloodGroup, setAddBloodGroup] = useState<BloodGroup | "">("")
  const [addUnits, setAddUnits] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/inventory")
      const invData = await res.json()
      setInventory(invData)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [search, bloodFilter, stockFilter])

  const filtered = useMemo(() => inventory.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch = !q || (BG_LABEL[item.bloodGroup] ?? "").toLowerCase().includes(q)
    const matchBlood = bloodFilter === "ALL" || item.bloodGroup === bloodFilter
    const matchStock = stockFilter === "ALL" ||
      (stockFilter === "OUT"  && item.availableUnits === 0) ||
      (stockFilter === "LOW"  && item.availableUnits > 0  && item.availableUnits <= 5) ||
      (stockFilter === "MOD"  && item.availableUnits > 5  && item.availableUnits <= 20) ||
      (stockFilter === "GOOD" && item.availableUnits > 20)
    return matchSearch && matchBlood && matchStock
  }), [inventory, search, bloodFilter, stockFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const openEdit = (item: InventoryItem) => {
    setEditItem(item)
    setEditUnits(String(item.availableUnits))
    setError("")
  }
  
  const handleUpdate = async () => {
    if (!editItem) return
    setSaving(true); setError("")
    try {
      // Actually we upsert since it's central inventory based on bloodGroup
      const res = await fetch(`/api/admin/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodGroup: editItem.bloodGroup, availableUnits: Number(editUnits) }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      await fetchData(); setEditItem(null)
    } finally { setSaving(false) }
  }
  
  const handleAdd = async () => {
    if (!addBloodGroup || !addUnits) { setError("Blood group and units are required."); return }
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodGroup: addBloodGroup, availableUnits: Number(addUnits) }),
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      await fetchData()
      setAddOpen(false); setAddBloodGroup(""); setAddUnits("")
    } finally { setSaving(false) }
  }

  const totalUnits    = inventory.reduce((s, i) => s + i.availableUnits, 0)
  const lowStockCount = inventory.filter((i) => i.availableUnits > 0 && i.availableUnits <= 5).length
  const outOfStock    = inventory.filter((i) => i.availableUnits === 0).length
  const goodStock     = inventory.filter((i) => i.availableUnits > 20).length

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Central Blood Inventory</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage blood stock levels for the central blood bank</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} className="gap-2">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-2"
            onClick={() => { setAddOpen(true); setError("") }}>
            <Plus className="h-3.5 w-3.5" />Add Stock
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Units",  value: totalUnits,    Icon: Droplet,       color: "text-blue-600",   bg: "bg-blue-50" },
          { label: "Good Stock",   value: goodStock,     Icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50" },
          { label: "Low Stock",    value: lowStockCount, Icon: TrendingDown,  color: "text-orange-600", bg: "bg-orange-50" },
          { label: "Out of Stock", value: outOfStock,    Icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50" },
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

      <Card className="shadow-xs">
        <CardHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input placeholder="Search blood group…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={bloodFilter} onValueChange={(v) => setBloodFilter(v ?? "ALL")}>
                <SelectTrigger className="h-9 w-28 text-xs"><SelectValue placeholder="Blood group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Groups</SelectItem>
                  {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{BG_LABEL[bg]}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={(v) => setStockFilter(v ?? "ALL")}>
                <SelectTrigger className="h-9 w-32 text-xs"><SelectValue placeholder="Stock level" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="OUT">Out of Stock</SelectItem>
                  <SelectItem value="LOW">Low Stock</SelectItem>
                  <SelectItem value="MOD">Moderate</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                </SelectContent>
              </Select>
              {(search || bloodFilter !== "ALL" || stockFilter !== "ALL") && (
                <Button variant="ghost" size="sm" className="h-9 text-xs text-muted-foreground"
                  onClick={() => { setSearch(""); setBloodFilter("ALL"); setStockFilter("ALL") }}>Clear</Button>
              )}
              <span className="text-xs text-muted-foreground">{filtered.length} of {inventory.length}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="pl-6 text-xs w-[120px]">Blood</TableHead>
                  <TableHead className="text-xs w-[180px]">Stock Level</TableHead>
                  <TableHead className="text-xs">Units</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden lg:table-cell">Last Updated</TableHead>
                  <TableHead className="text-xs pr-6 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={6} className="py-16 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">Loading inventory…</p>
                  </TableCell></TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="py-16 text-center">
                    <Package className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-sm font-medium text-muted-foreground">No inventory records</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Try adjusting filters or add new stock</p>
                  </TableCell></TableRow>
                ) : paginated.map((item) => {
                  const st = stockInfo(item.availableUnits)
                  return (
                    <TableRow key={item.id} className={item.availableUnits === 0 ? "bg-red-50/30" : item.availableUnits <= 5 ? "bg-orange-50/20" : ""}>
                      <TableCell className="pl-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${BG_COLORS[item.bloodGroup] ?? "bg-gray-100 text-gray-700"}`}>
                          {BG_LABEL[item.bloodGroup] ?? item.bloodGroup}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">{st.pct}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${st.bar}`} style={{ width: `${Math.max(st.pct, item.availableUnits === 0 ? 0 : 3)}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`text-lg font-bold tabular-nums ${item.availableUnits === 0 ? "text-red-600" : item.availableUnits <= 5 ? "text-orange-600" : "text-foreground"}`}>
                          {item.availableUnits}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${st.cls}`}>{st.label}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">{fmtDate(item.lastUpdated)}</TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button variant="outline" size="sm" onClick={() => openEdit(item)}
                          className="h-8 text-xs gap-1.5 hover:bg-muted">
                          <Pencil className="h-3 w-3" />Update
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Edit Stock Dialog ── */}
      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Stock</DialogTitle>
            <DialogDescription>Adjust available units for this blood group.</DialogDescription>
          </DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${BG_COLORS[editItem.bloodGroup] ?? "bg-gray-100 text-gray-700"}`}>
                  {BG_LABEL[editItem.bloodGroup] ?? editItem.bloodGroup}
                </span>
                <span className="text-sm font-medium flex-1">Central Blood Bank</span>
              </div>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="editUnits">Available Units</FieldLabel>
                  <Input id="editUnits" type="number" min="0" value={editUnits} onChange={(e) => setEditUnits(e.target.value)} />
                </Field>
              </FieldGroup>
              {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{error}</p>}
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Stock Dialog ── */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Stock Entry</DialogTitle>
            <DialogDescription>Add a new blood group stock record to the central bank.</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>Blood Group</FieldLabel>
              <Select value={addBloodGroup} onValueChange={(v) => setAddBloodGroup((v ?? "") as BloodGroup)}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => <SelectItem key={bg} value={bg}>{BG_LABEL[bg]}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="addUnits">Units</FieldLabel>
              <Input id="addUnits" type="number" min="0" placeholder="0" value={addUnits} onChange={(e) => setAddUnits(e.target.value)} />
            </Field>
            {error && <p className="text-xs text-red-600 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{error}</p>}
          </FieldGroup>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={saving} className="bg-red-600 hover:bg-red-700 text-white gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}Add Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
