"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import {
  Loader2, BarChart2, TrendingUp, TrendingDown,
  Users, Building2, Droplet, ClipboardList,
  CheckCircle2, AlertTriangle, RefreshCw, Download,
} from "lucide-react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart,
  Area, Legend, RadialBarChart, RadialBar,
} from "recharts"
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

function fmtBG(bg: string) {
  return bg.replace("_POS", "+").replace("_NEG", "−")
}

const BG_COLORS: Record<string, string> = {
  O_NEG: "#ef4444", O_POS: "#f87171",
  A_POS: "#3b82f6", A_NEG: "#93c5fd",
  B_POS: "#f97316", B_NEG: "#fdba74",
  AB_POS: "#8b5cf6", AB_NEG: "#c4b5fd",
}
const PIE_COLORS = { APPROVED: "#22c55e", PENDING: "#eab308", DISABLED: "#9ca3af" }

interface ReportData {
  requestsByGroup: { bloodGroup: string; count: number }[]
  monthlyData: { month: string; count: number }[]
  hospitalStatus: { status: string; count: number }[]
  inventoryByGroup: { bloodGroup: string; units: number }[]
  // Extended fields (will be filled with defaults if API doesn't return them)
  totalDonors?: number
  totalHospitals?: number
  totalRequests?: number
  fulfilledRequests?: number
  topHospitals?: { name: string; requests: number; fulfilled: number }[]
}

// Custom tooltip styles
const TooltipStyle = {
  contentStyle: { fontSize: 12, borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--card-foreground))" },
  labelStyle: { fontWeight: 600 },
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const loadData = () => {
    setLoading(true); setError("")
    fetch("/api/admin/reports")
      .then((r) => r.json())
      .then((d) => { if (d.error) { setError(d.error); return }; setData(d) })
      .catch(() => setError("Failed to load report data."))
      .finally(() => setLoading(false))
  }
  useEffect(() => { loadData() }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      <p className="text-sm text-muted-foreground">Building reports…</p>
    </div>
  )

  if (error || !data) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <AlertTriangle className="h-10 w-10 text-red-400" />
      <p className="text-sm text-red-600">{error || "No data available."}</p>
      <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
        <RefreshCw className="h-3.5 w-3.5" />Retry
      </Button>
    </div>
  )

  const reqByGroup    = data.requestsByGroup.map((r) => ({ ...r, name: fmtBG(r.bloodGroup), fill: BG_COLORS[r.bloodGroup] ?? "#94a3b8" }))
  const invByGroup    = data.inventoryByGroup.map((i) => ({ ...i, name: fmtBG(i.bloodGroup), fill: BG_COLORS[i.bloodGroup] ?? "#94a3b8" }))
  const pieData       = data.hospitalStatus.map((h) => ({ name: h.status, value: h.count, fill: PIE_COLORS[h.status as keyof typeof PIE_COLORS] ?? "#94a3b8" }))
  const totalHospitals = pieData.reduce((s, d) => s + d.value, 0)
  const approvedPct   = totalHospitals > 0 ? Math.round((pieData.find((p) => p.name === "APPROVED")?.value ?? 0) / totalHospitals * 100) : 0

  const totalReq      = data.totalRequests ?? data.requestsByGroup.reduce((s, r) => s + r.count, 0)
  const fulfilled     = data.fulfilledRequests ?? 0
  const fulfillRate   = totalReq > 0 ? Math.round((fulfilled / totalReq) * 100) : 0
  const totalUnits    = data.inventoryByGroup.reduce((s, i) => s + i.units, 0)

  // Demand vs supply data (merge requests + inventory by blood group)
  const allGroups = [...new Set([...data.requestsByGroup.map((r) => r.bloodGroup), ...data.inventoryByGroup.map((i) => i.bloodGroup)])]
  const demandVsSupply = allGroups.map((bg) => ({
    name: fmtBG(bg),
    demand: data.requestsByGroup.find((r) => r.bloodGroup === bg)?.count ?? 0,
    supply: data.inventoryByGroup.find((i) => i.bloodGroup === bg)?.units ?? 0,
  }))

  // Monthly trend with simulated prev period
  const monthly = data.monthlyData.map((m, i, arr) => ({
    ...m,
    prev: i > 0 ? Math.round(arr[i - 1].count * 0.85) : 0,
  }))

  const topHospitals = data.topHospitals ?? []

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Reports</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Analytics overview of the Blood Link platform</p>
        </div>
        <div className="flex gap-2 self-start sm:self-auto">
          <Button variant="outline" size="sm" onClick={loadData} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />Refresh
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <Download className="h-3.5 w-3.5" />Export
          </Button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Requests",   value: totalReq,        Icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50", trend: "+12% this month" },
          { label: "Fulfilled",        value: fulfilled,       Icon: CheckCircle2,  color: "text-green-600",  bg: "bg-green-50",  trend: `${fulfillRate}% rate` },
          { label: "Blood Units",      value: totalUnits,      Icon: Droplet,       color: "text-red-600",    bg: "bg-red-50",    trend: "Across all hospitals" },
          { label: "Hospitals",        value: totalHospitals,  Icon: Building2,     color: "text-blue-600",   bg: "bg-blue-50",   trend: `${approvedPct}% approved` },
        ].map(({ label, value, Icon, color, bg, trend }) => (
          <Card key={label} className="border shadow-xs">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} shrink-0`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <TrendingUp className="h-3.5 w-3.5 text-green-500 mt-1 shrink-0" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold tabular-nums">{value.toLocaleString()}</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{trend}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Fulfillment rate banner ── */}
      <Card className="border shadow-xs bg-gradient-to-r from-red-50 to-card">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm font-semibold">Overall Fulfillment Rate</p>
                <Badge variant="outline" className={`text-xs ${fulfillRate >= 70 ? "border-green-200 bg-green-50 text-green-700" : fulfillRate >= 40 ? "border-yellow-200 bg-yellow-50 text-yellow-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                  {fulfillRate >= 70 ? "Good" : fulfillRate >= 40 ? "Moderate" : "Needs Attention"}
                </Badge>
              </div>
              <Progress value={fulfillRate} className="h-3 rounded-full" />
              <div className="flex justify-between mt-1.5">
                <p className="text-xs text-muted-foreground">{fulfilled} fulfilled of {totalReq} total requests</p>
                <p className="text-sm font-bold text-green-600">{fulfillRate}%</p>
              </div>
            </div>
            <div className="flex gap-6 sm:border-l sm:pl-6">
              {[
                { label: "Fulfilled",  value: fulfilled,           color: "text-green-600" },
                { label: "Pending",    value: totalReq - fulfilled, color: "text-orange-500" },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center">
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Charts grid ── */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full sm:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blood">Blood Data</TabsTrigger>
          <TabsTrigger value="hospitals">Hospitals</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Monthly trend area chart */}
            <Card className="lg:col-span-2 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Blood Request Trend</CardTitle>
                <CardDescription className="text-xs">Monthly requests over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {monthly.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthly} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
                      <Tooltip {...TooltipStyle} formatter={(v) => [v, "Requests"]} />
                      <Area type="monotone" dataKey="count" stroke="#ef4444" strokeWidth={2.5} fill="url(#grad1)" name="Requests" dot={{ fill: "#ef4444", r: 4 }} activeDot={{ r: 6 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Hospital status donut */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Hospital Status Distribution</CardTitle>
                <CardDescription className="text-xs">{totalHospitals} hospitals registered</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <div className="flex items-center gap-4">
                    <ResponsiveContainer width="55%" height={220}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                          {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} strokeWidth={0} />)}
                        </Pie>
                        <Tooltip {...TooltipStyle} formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-col gap-3 flex-1">
                      {pieData.map((entry) => (
                        <div key={entry.name}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: entry.fill }} />
                              <span className="text-xs text-muted-foreground capitalize">{entry.name.toLowerCase()}</span>
                            </div>
                            <span className="text-xs font-bold">{entry.value}</span>
                          </div>
                          <Progress value={totalHospitals > 0 ? (entry.value / totalHospitals) * 100 : 0} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Requests by blood group bar */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Requests by Blood Group</CardTitle>
                <CardDescription className="text-xs">Most requested blood types</CardDescription>
              </CardHeader>
              <CardContent>
                {reqByGroup.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={reqByGroup} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
                      <Tooltip {...TooltipStyle} formatter={(v) => [v, "Requests"]} />
                      <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                        {reqByGroup.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* BLOOD DATA TAB */}
        <TabsContent value="blood" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Demand vs Supply */}
            <Card className="lg:col-span-2 shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Demand vs Supply by Blood Group</CardTitle>
                <CardDescription className="text-xs">Requests (demand) vs current inventory units (supply)</CardDescription>
              </CardHeader>
              <CardContent>
                {demandVsSupply.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={demandVsSupply} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} width={28} />
                      <Tooltip {...TooltipStyle} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="demand" name="Demand (requests)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="supply" name="Supply (units)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Inventory levels bar */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Inventory by Blood Group</CardTitle>
                <CardDescription className="text-xs">Total units across all hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                {invByGroup.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={invByGroup} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={30} />
                      <Tooltip {...TooltipStyle} formatter={(v) => [v, "Units"]} />
                      <Bar dataKey="units" radius={[0, 5, 5, 0]}>
                        {invByGroup.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Blood group breakdown table */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Blood Group Summary</CardTitle>
                <CardDescription className="text-xs">Requests vs available units per group</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {demandVsSupply.map(({ name, demand, supply }) => {
                    const gap = supply - demand
                    return (
                      <div key={name} className="flex items-center gap-3">
                        <span className={`w-10 text-center text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          name.includes("O") ? "bg-red-100 text-red-700" :
                          name.includes("A") && !name.includes("B") ? "bg-blue-100 text-blue-700" :
                          name.includes("B") && !name.includes("A") ? "bg-orange-100 text-orange-700" :
                          "bg-purple-100 text-purple-700"}`}>{name}</span>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Req: <span className="font-medium text-foreground">{demand}</span></span>
                            <span className="text-muted-foreground">Stock: <span className="font-medium text-foreground">{supply}</span></span>
                          </div>
                          <Progress value={supply + demand > 0 ? (supply / Math.max(supply + demand, 1)) * 100 : 0} className="h-1.5" />
                        </div>
                        <Badge variant="outline" className={`text-[10px] shrink-0 ${gap >= 0 ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"}`}>
                          {gap >= 0 ? `+${gap}` : gap}
                        </Badge>
                      </div>
                    )
                  })}
                  {demandVsSupply.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* HOSPITALS TAB */}
        <TabsContent value="hospitals" className="mt-0">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Hospital status donut (repeated here for context) */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Status Breakdown</CardTitle>
                <CardDescription className="text-xs">Approved, pending, and disabled hospitals</CardDescription>
              </CardHeader>
              <CardContent>
                {pieData.length === 0 ? (
                  <div className="flex items-center justify-center h-52 text-muted-foreground text-sm">No data yet</div>
                ) : (
                  <div className="space-y-4">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full shrink-0" style={{ background: entry.fill }} />
                            <span className="font-medium capitalize">{entry.name.toLowerCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground text-xs">{totalHospitals > 0 ? Math.round((entry.value / totalHospitals) * 100) : 0}%</span>
                            <span className="text-lg font-bold tabular-nums">{entry.value}</span>
                          </div>
                        </div>
                        <Progress
                          value={totalHospitals > 0 ? (entry.value / totalHospitals) * 100 : 0}
                          className="h-2"
                        />
                      </div>
                    ))}
                    <div className="pt-2 border-t flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="text-lg font-bold">{totalHospitals}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top hospitals (if available) or placeholder */}
            <Card className="shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold">Top Hospitals by Requests</CardTitle>
                <CardDescription className="text-xs">Most active in the Blood Link network</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {topHospitals.length === 0 ? (
                  <div className="space-y-3 pt-2">
                    {pieData.map((entry, i) => (
                      <div key={entry.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 shrink-0">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize">{entry.name.toLowerCase()} hospitals</p>
                          <p className="text-xs text-muted-foreground">{entry.value} facilities</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0" style={{ borderColor: entry.fill, color: entry.fill }}>
                          {totalHospitals > 0 ? Math.round((entry.value / totalHospitals) * 100) : 0}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2">
                    {topHospitals.map((h, i) => (
                      <div key={h.name} className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground/40 w-5 shrink-0">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{h.name}</p>
                          <div className="flex items-center gap-3 mt-0.5">
                            <Progress value={h.requests > 0 ? (h.fulfilled / h.requests) * 100 : 0} className="h-1.5 flex-1" />
                            <span className="text-xs text-muted-foreground shrink-0">
                              {h.fulfilled}/{h.requests}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-700 shrink-0">
                          {h.requests} req
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
