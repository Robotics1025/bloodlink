"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useHospitalLayout } from "@/contexts/hospital-layout-context"

const BG_COLOR: Record<string, string> = {
  O_NEG: "bg-red-700",   O_POS: "bg-red-500",
  A_POS: "bg-slate-700", A_NEG: "bg-slate-500",
  B_POS: "bg-rose-600",  B_NEG: "bg-rose-400",
  AB_POS: "bg-red-900",  AB_NEG: "bg-red-800",
}
const URGENCY: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  URGENT:   "bg-orange-100 text-orange-700 border-orange-200",
  NORMAL:   "bg-slate-100 text-slate-600 border-slate-200",
}
const STATUS: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700 border-amber-200",
  APPROVED:  "bg-green-100 text-green-700 border-green-200",
  PARTIAL:   "bg-slate-100 text-slate-600 border-slate-200",
  FULFILLED: "bg-emerald-100 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-gray-100 text-gray-400 border-gray-200",
}

const TABS = ["ALL", "PENDING", "APPROVED", "FULFILLED", "CANCELLED", "PARTIAL"] as const
type Tab = typeof TABS[number]

interface Request {
  id: number
  bloodGroup: string
  bgLabel: string
  unitsRequired: number
  unitsFulfilled: number
  urgencyLevel: string
  status: string
  location: string
  reason: string | null
  createdAt: string
}

export function RequestsClient({ requests }: { requests: Request[] }) {
  const [tab, setTab] = useState<Tab>("ALL")
  const [search, setSearch] = useState("")
  const { setPostRequestOpen } = useHospitalLayout()

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: requests.length }
    requests.forEach((r) => { c[r.status] = (c[r.status] ?? 0) + 1 })
    return c
  }, [requests])

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchTab = tab === "ALL" || r.status === tab
      const q = search.toLowerCase()
      const matchSearch = !q
        || r.bgLabel.toLowerCase().includes(q)
        || r.status.toLowerCase().includes(q)
        || r.urgencyLevel.toLowerCase().includes(q)
        || r.location.toLowerCase().includes(q)
        || (r.reason ?? "").toLowerCase().includes(q)
      return matchTab && matchSearch
    })
  }, [requests, tab, search])

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-slate-100">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 sm:pb-0">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                tab === t
                  ? "bg-red-600 text-white"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              )}>
              {t === "ALL" ? "All" : t.charAt(0) + t.slice(1).toLowerCase()}
              <span className={cn(
                "text-[10px] px-1 py-0.5 rounded-full font-bold tabular-nums",
                tab === t ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              )}>
                {counts[t === "ALL" ? "ALL" : t] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Search + new */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-8 pr-3 h-8 w-44 rounded-lg border border-slate-200 text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-200 bg-slate-50 placeholder:text-slate-400"
            />
          </div>
          <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white h-8 gap-1.5 text-xs font-bold px-3"
            onClick={() => setPostRequestOpen(true)}>
            <Plus className="w-3.5 h-3.5" />New
          </Button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
          <Filter className="w-8 h-8 text-slate-200" />
          <p className="text-sm font-medium">No requests found</p>
          <p className="text-xs">Try changing the filter or search term</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100">
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Blood</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Required</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfilled</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgency</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-3 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">Location</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5">
                    <span className={cn(
                      "inline-flex w-10 h-7 rounded-lg items-center justify-center text-white font-extrabold text-xs",
                      BG_COLOR[req.bloodGroup] ?? "bg-slate-700"
                    )}>
                      {req.bgLabel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-bold text-slate-900 text-sm tabular-nums">{req.unitsRequired}</td>
                  <td className="px-3 py-2.5 tabular-nums text-sm">
                    <span className={cn("font-semibold",
                      req.unitsFulfilled >= req.unitsRequired ? "text-green-600"
                        : req.unitsFulfilled > 0 ? "text-amber-500"
                        : "text-slate-300")}>
                      {req.unitsFulfilled}
                    </span>
                    <span className="text-slate-300 text-xs"> / {req.unitsRequired}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", URGENCY[req.urgencyLevel])}>
                      {req.urgencyLevel}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", STATUS[req.status])}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-slate-400 max-w-[130px] truncate hidden md:table-cell">
                    {req.location}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count */}
      <div className="px-4 py-2.5 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[11px] text-slate-400">
          Showing <strong className="text-slate-600">{filtered.length}</strong> of <strong className="text-slate-600">{requests.length}</strong> requests
        </p>
        {filtered.length > 0 && (
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {requests.filter(r => r.status === "PENDING").length} awaiting fulfillment
          </p>
        )}
      </div>
    </div>
  )
}
