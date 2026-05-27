"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Loader2, RefreshCw, Package, AlertTriangle,
  CheckCircle, TrendingDown, Pencil, Droplet,
  Search, ArrowUpDown, ArrowUp, ArrowDown,
} from "lucide-react"
import { cn } from "@/lib/utils"

type FilterTab = "ALL" | "ADEQUATE" | "LOW" | "CRITICAL"
type SortField = "bloodGroup" | "availableUnits" | "expiryDate"
type SortDir   = "asc" | "desc"

const ALL_BLOOD_GROUPS = [
  { value: "A_POS",  label: "A+"  },
  { value: "A_NEG",  label: "A−"  },
  { value: "B_POS",  label: "B+"  },
  { value: "B_NEG",  label: "B−"  },
  { value: "AB_POS", label: "AB+" },
  { value: "AB_NEG", label: "AB−" },
  { value: "O_POS",  label: "O+"  },
  { value: "O_NEG",  label: "O−"  },
]

const BG_COLOR: Record<string, string> = {
  O_NEG:  "bg-red-700",   O_POS:  "bg-red-500",
  A_POS:  "bg-slate-700", A_NEG:  "bg-slate-500",
  B_POS:  "bg-rose-600",  B_NEG:  "bg-rose-400",
  AB_POS: "bg-red-900",   AB_NEG: "bg-red-800",
}

function stockMeta(units: number) {
  if (units === 0) return { label: "Out of Stock", bar: "[&>div]:bg-red-500",   text: "text-red-600",   badge: "bg-red-50 text-red-600 border-red-200"       }
  if (units <= 5)  return { label: "Critical",     bar: "[&>div]:bg-red-500",   text: "text-red-600",   badge: "bg-red-50 text-red-600 border-red-200"       }
  if (units <= 10) return { label: "Low",          bar: "[&>div]:bg-amber-400", text: "text-amber-600", badge: "bg-amber-50 text-amber-600 border-amber-200" }
  return              { label: "Adequate",          bar: "[&>div]:bg-green-500", text: "text-green-600", badge: "bg-green-50 text-green-600 border-green-200" }
}

interface InventoryItem {
  id?: number
  bloodGroup: string
  availableUnits: number
  expiryDate: string | null
}

export default function InventoryPage() {
  const { data: session, status } = useSession()
  const [inventory, setInventory]   = useState<InventoryItem[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing]       = useState<InventoryItem | null>(null)
  const [editUnits, setEditUnits]   = useState("")
  const [editExpiry, setEditExpiry] = useState("")
  const [saving, setSaving]         = useState(false)
  const [search, setSearch]         = useState("")
  const [filterTab, setFilterTab]   = useState<FilterTab>("ALL")
  const [sortField, setSortField]   = useState<SortField>("bloodGroup")
  const [sortDir, setSortDir]       = useState<SortDir>("asc")

  const fetchInventory = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true)
    try {
      const res = await fetch("/api/hospital/inventory")
      if (!res.ok) throw new Error()
      const data: InventoryItem[] = await res.json()
      const map = new Map(data.map((i) => [i.bloodGroup, i]))
      setInventory(ALL_BLOOD_GROUPS.map((bg) =>
        map.get(bg.value) ?? { bloodGroup: bg.value, availableUnits: 0, expiryDate: null }
      ))
    } catch { toast.error("Failed to load inventory") }
    finally { setLoading(false); setRefreshing(false) }
  }, [])

  useEffect(() => { if (status === "authenticated") fetchInventory() }, [status, fetchInventory])

  const filtered = useMemo(() => {
    let rows = [...inventory]
    if (filterTab === "ADEQUATE") rows = rows.filter((i) => i.availableUnits > 10)
    if (filterTab === "LOW")      rows = rows.filter((i) => i.availableUnits > 5 && i.availableUnits <= 10)
    if (filterTab === "CRITICAL") rows = rows.filter((i) => i.availableUnits <= 5)
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter((i) => {
        const lbl = ALL_BLOOD_GROUPS.find((b) => b.value === i.bloodGroup)?.label ?? ""
        return lbl.toLowerCase().includes(q) || i.bloodGroup.toLowerCase().includes(q)
      })
    }
    rows.sort((a, b) => {
      let cmp = 0
      if (sortField === "bloodGroup")     cmp = a.bloodGroup.localeCompare(b.bloodGroup)
      if (sortField === "availableUnits") cmp = a.availableUnits - b.availableUnits
      if (sortField === "expiryDate") {
        const da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity
        const db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity
        cmp = da - db
      }
      return sortDir === "asc" ? cmp : -cmp
    })
    return rows
  }, [inventory, filterTab, search, sortField, sortDir])

  const openEdit = (item: InventoryItem) => {
    setEditing(item)
    setEditUnits(String(item.availableUnits))
    setEditExpiry(item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "")
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!editing) return
    const units = Number(editUnits)
    if (isNaN(units) || units < 0) { toast.error("Enter a valid number ≥ 0"); return }
    setSaving(true)
    try {
      const res = await fetch("/api/hospital/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodGroup: editing.bloodGroup, availableUnits: units, expiryDate: editExpiry || undefined }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to update"); return }
      toast.success("Inventory updated!")
      setDialogOpen(false)
      fetchInventory()
    } catch { toast.error("Something went wrong") }
    finally { setSaving(false) }
  }

  const bgLabel = (val: string) => ALL_BLOOD_GROUPS.find((b) => b.value === val)?.label ?? val

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    )
  }

  const totalUnits    = inventory.reduce((s, i) => s + i.availableUnits, 0)
  const criticalCount = inventory.filter((i) => i.availableUnits <= 5).length
  const lowCount      = inventory.filter((i) => i.availableUnits > 5 && i.availableUnits <= 10).length
  const adequateCount = inventory.filter((i) => i.availableUnits > 10).length
  const maxUnits      = Math.max(...inventory.map((i) => i.availableUnits), 1)

  const tabCounts: Record<FilterTab, number> = {
    ALL:      inventory.length,
    ADEQUATE: adequateCount,
    LOW:      lowCount,
    CRITICAL: criticalCount,
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else { setSortField(field); setSortDir("asc") }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-300 ml-1 inline" />
    return sortDir === "asc"
      ? <ArrowUp   className="w-3 h-3 text-red-500 ml-1 inline" />
      : <ArrowDown className="w-3 h-3 text-red-500 ml-1 inline" />
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Blood Inventory</h1>
          <p className="text-xs text-slate-400 mt-0.5">Monitor and update your blood stock levels</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchInventory(true)} disabled={refreshing}
          className="gap-2 h-8 text-xs border-slate-200 text-slate-600">
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Units",    value: totalUnits,    Icon: Package,       color: "text-slate-700", bg: "bg-slate-100" },
          { label: "Critical / Out", value: criticalCount, Icon: AlertTriangle, color: "text-red-600",   bg: "bg-red-100"   },
          { label: "Low Stock",      value: lowCount,      Icon: TrendingDown,  color: "text-amber-600", bg: "bg-amber-100" },
          { label: "Adequate",       value: adequateCount, Icon: CheckCircle,   color: "text-green-600", bg: "bg-green-100" },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div>
              <p className={cn("text-xl font-extrabold tabular-nums leading-none", color)}>{value}</p>
              <p className="text-[10px] text-slate-400 font-medium mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Inventory table ── */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">

        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
          {/* Status tabs */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {(["ALL","ADEQUATE","LOW","CRITICAL"] as FilterTab[]).map((t) => (
              <button key={t} onClick={() => setFilterTab(t)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                  filterTab === t
                    ? "bg-red-600 text-white"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                )}>
                {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
                <span className={cn(
                  "text-[10px] px-1 py-0.5 rounded-full font-bold tabular-nums",
                  filterTab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  {tabCounts[t]}
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search blood group…"
              className="pl-8 pr-3 h-8 w-48 rounded-lg border border-slate-200 text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 bg-slate-50 placeholder:text-slate-400"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-2 text-slate-400">
            <Package className="w-8 h-8 text-slate-200" />
            <p className="text-sm font-medium">No groups match your filter</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="text-left px-4 py-2.5">
                  <button onClick={() => toggleSort("bloodGroup")}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors">
                    Blood Group<SortIcon field="bloodGroup" />
                  </button>
                </th>
                <th className="text-left px-4 py-2.5">
                  <button onClick={() => toggleSort("availableUnits")}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors">
                    Units<SortIcon field="availableUnits" />
                  </button>
                </th>
                <th className="text-left px-4 py-2.5 w-44 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Level</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 hidden md:table-cell">
                  <button onClick={() => toggleSort("expiryDate")}
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors">
                    Expiry<SortIcon field="expiryDate" />
                  </button>
                </th>
                <th className="text-right px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((item) => {
                const { label, bar, text, badge } = stockMeta(item.availableUnits)
                const pct = Math.round((item.availableUnits / maxUnits) * 100)
                const lbl = bgLabel(item.bloodGroup)
                return (
                  <tr key={item.bloodGroup} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className={cn(
                          "w-10 h-8 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0",
                          BG_COLOR[item.bloodGroup] ?? "bg-slate-700"
                        )}>
                          {lbl}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 hidden sm:block">{lbl} Blood</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-lg font-extrabold tabular-nums", text)}>{item.availableUnits}</span>
                      <span className="text-[11px] text-slate-400 ml-1">units</span>
                    </td>
                    <td className="px-4 py-3 w-44">
                      <Progress value={pct} className={cn("h-2", bar)} />
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[10px] font-bold px-2 py-1 rounded-full border", badge)}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 hidden md:table-cell">
                      {item.expiryDate
                        ? new Date(item.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Pencil className="w-3 h-3" />Update
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-400">
            Showing <strong className="text-slate-600">{filtered.length}</strong> of <strong className="text-slate-600">{inventory.length}</strong> groups
          </p>
          <p className="text-[11px]">
            {criticalCount > 0
              ? <span className="text-red-600 font-semibold">⚠ {criticalCount} group{criticalCount > 1 ? "s" : ""} need restocking</span>
              : <span className="text-green-600 font-semibold">✓ All groups adequate</span>}
          </p>
        </div>
      </div>

      {/* ── Edit Dialog ── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-slate-900">
              <span className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-base shrink-0",
                BG_COLOR[editing?.bloodGroup ?? ""] ?? "bg-slate-700"
              )}>
                {editing ? bgLabel(editing.bloodGroup) : ""}
              </span>
              Update {editing ? bgLabel(editing.bloodGroup) : ""} Stock
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Available Units</label>
              <Input type="number" min={0} value={editUnits}
                onChange={(e) => setEditUnits(e.target.value)} placeholder="e.g. 20"
                className="focus-visible:ring-red-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Expiry Date <span className="text-slate-400 font-normal normal-case">(optional)</span>
              </label>
              <Input type="date" value={editExpiry}
                onChange={(e) => setEditExpiry(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="focus-visible:ring-red-500" />
            </div>
            {editUnits !== "" && !isNaN(Number(editUnits)) && (
              <div className={cn("flex items-center gap-2 p-3 rounded-lg border text-xs font-medium",
                stockMeta(Number(editUnits)).badge)}>
                <Droplet className="w-3.5 h-3.5 shrink-0" />
                After update: <strong className="ml-1">{stockMeta(Number(editUnits)).label}</strong>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={saving} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
