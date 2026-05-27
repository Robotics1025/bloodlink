"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Search, Droplet, FilterX, Building2, MapPin,
  AlertTriangle, Clock, ChevronRight, HeartHandshake,
  ClipboardList,
} from "lucide-react"
import { bloodGroupLabel, urgencyColor, statusColor } from "@/lib/utils"
import { cn } from "@/lib/utils"

interface BloodRequest {
  id: number
  bloodGroup: string
  hospitalName: string
  unitsRequired: number
  unitsFulfilled: number
  urgencyLevel: string
  location: string
  status: string
  reason: string | null
  createdAt: string
}

const BLOOD_GROUPS = ["A_POS","A_NEG","B_POS","B_NEG","AB_POS","AB_NEG","O_POS","O_NEG"]
const URGENCY_LEVELS = ["CRITICAL","URGENT","NORMAL"]

const urgencyConfig: Record<string, { label: string; icon: React.ElementType; dot: string }> = {
  CRITICAL: { label: "Critical",  icon: AlertTriangle, dot: "bg-red-500"    },
  URGENT:   { label: "Urgent",    icon: Clock,         dot: "bg-amber-500"  },
  NORMAL:   { label: "Normal",    icon: Droplet,       dot: "bg-green-500"  },
}

export function BloodRequestsClient({ requests }: { requests: BloodRequest[] }) {
  const [search, setSearch]               = useState("")
  const [urgencyFilter, setUrgencyFilter] = useState("ALL")
  const [bgFilter, setBgFilter]           = useState("ALL")

  const counts = useMemo(() => ({
    ALL:      requests.length,
    CRITICAL: requests.filter(r => r.urgencyLevel === "CRITICAL").length,
    URGENT:   requests.filter(r => r.urgencyLevel === "URGENT").length,
    NORMAL:   requests.filter(r => r.urgencyLevel === "NORMAL").length,
  }), [requests])

  const filtered = useMemo(() => requests.filter(r => {
    const q = search.toLowerCase()
    const matchSearch =
      !q ||
      r.hospitalName.toLowerCase().includes(q) ||
      r.location.toLowerCase().includes(q) ||
      (r.reason?.toLowerCase().includes(q) ?? false)
    const matchUrgency = urgencyFilter === "ALL" || r.urgencyLevel === urgencyFilter
    const matchBg      = bgFilter === "ALL"      || r.bloodGroup === bgFilter
    return matchSearch && matchUrgency && matchBg
  }), [requests, search, urgencyFilter, bgFilter])

  const hasFilters = search !== "" || urgencyFilter !== "ALL" || bgFilter !== "ALL"

  const clearFilters = () => { setSearch(""); setUrgencyFilter("ALL"); setBgFilter("ALL") }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-red-500" />
            Blood Requests
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active requests from hospitals — your donation can save a life
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: "ALL",      label: "All",      color: "bg-slate-100 text-slate-700"  },
            { key: "CRITICAL", label: "Critical", color: "bg-red-50 text-red-700"       },
            { key: "URGENT",   label: "Urgent",   color: "bg-amber-50 text-amber-700"   },
            { key: "NORMAL",   label: "Normal",   color: "bg-green-50 text-green-700"   },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setUrgencyFilter(key)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all",
                urgencyFilter === key
                  ? "ring-2 ring-offset-1 ring-red-400 border-transparent shadow-sm " + color
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              )}
            >
              {key !== "ALL" && (
                <span className={cn("w-1.5 h-1.5 rounded-full", urgencyConfig[key].dot)} />
              )}
              {label}
              <span className={cn(
                "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                urgencyFilter === key ? "bg-white/70" : "bg-slate-100 text-slate-500"
              )}>
                {counts[key as keyof typeof counts]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search hospital, location, reason…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-slate-200 focus-visible:ring-red-400"
            />
          </div>

          {/* Blood group filter */}
          <Select value={bgFilter} onValueChange={v => setBgFilter(v ?? "ALL")}>
            <SelectTrigger className="h-9 w-full sm:w-40 text-sm border-slate-200">
              <SelectValue placeholder="Blood Group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Blood Groups</SelectItem>
              {BLOOD_GROUPS.map(bg => (
                <SelectItem key={bg} value={bg}>{bloodGroupLabel(bg)}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}
              className="h-9 text-slate-500 hover:text-slate-700 text-sm gap-1.5">
              <FilterX className="w-4 h-4" /> Clear
            </Button>
          )}
        </div>

        <p className="text-[11px] text-slate-400 mt-2">
          Showing <span className="font-semibold text-slate-600">{filtered.length}</span> of {requests.length} request{requests.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ── Table / Empty ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 gap-3">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 text-red-300" />
          </div>
          <p className="text-sm font-semibold text-slate-600">No requests found</p>
          <p className="text-xs text-slate-400">
            {hasFilters ? "Try adjusting your filters." : "No active blood requests at this time."}
          </p>
          {hasFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters} className="text-xs mt-1 border-slate-200">
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3 pl-4">Blood</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Hospital</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Progress</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Urgency</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Location</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3">Date</TableHead>
                  <TableHead className="text-[11px] font-bold text-slate-500 uppercase tracking-wider py-3 pr-4 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((req) => {
                  const pct = req.unitsRequired > 0
                    ? Math.min(100, Math.round((req.unitsFulfilled / req.unitsRequired) * 100))
                    : 0
                  const isCritical = req.urgencyLevel === "CRITICAL"
                  return (
                    <TableRow
                      key={req.id}
                      className={cn(
                        "border-b border-slate-100 hover:bg-slate-50/60 transition-colors",
                        isCritical && "bg-red-50/30 hover:bg-red-50/60"
                      )}
                    >
                      {/* Blood group badge */}
                      <TableCell className="py-3 pl-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          isCritical ? "bg-red-600" : "bg-red-100"
                        )}>
                          <span className={cn(
                            "text-xs font-extrabold",
                            isCritical ? "text-white" : "text-red-700"
                          )}>
                            {bloodGroupLabel(req.bloodGroup)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Hospital */}
                      <TableCell className="py-3 max-w-[180px]">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-slate-800 truncate max-w-[140px]">
                              {req.hospitalName}
                            </p>
                            {req.reason && (
                              <p className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                                {req.reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Units progress */}
                      <TableCell className="py-3 min-w-[130px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">
                              <span className="font-bold text-slate-800">{req.unitsFulfilled}</span>
                              /{req.unitsRequired} units
                            </span>
                            <span className={cn(
                              "font-bold",
                              pct >= 75 ? "text-green-600" : pct >= 40 ? "text-amber-600" : "text-red-600"
                            )}>
                              {pct}%
                            </span>
                          </div>
                          <Progress
                            value={pct}
                            className={cn(
                              "h-1.5 rounded-full",
                              pct >= 75 ? "[&>div]:bg-green-500" : pct >= 40 ? "[&>div]:bg-amber-500" : "[&>div]:bg-red-500"
                            )}
                          />
                        </div>
                      </TableCell>

                      {/* Urgency */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={cn(
                            "w-1.5 h-1.5 rounded-full shrink-0",
                            req.urgencyLevel === "CRITICAL" ? "bg-red-500" :
                            req.urgencyLevel === "URGENT"   ? "bg-amber-500" : "bg-green-500"
                          )} />
                          <Badge className={cn("text-[11px] font-semibold border px-2 py-0.5", urgencyColor(req.urgencyLevel))}>
                            {req.urgencyLevel}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Location */}
                      <TableCell className="py-3">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs truncate max-w-[120px]">{req.location}</span>
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3">
                        <span className="text-[11px] text-slate-400">
                          {new Date(req.createdAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-3 pr-4 text-right">
                        <Button
                          size="sm"
                          className={cn(
                            "h-7 text-xs gap-1 font-semibold",
                            isCritical
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                          )}
                        >
                          Donate <ChevronRight className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {/* Footer count */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
            <p className="text-[11px] text-slate-400">
              {filtered.length} request{filtered.length !== 1 ? "s" : ""} shown
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
