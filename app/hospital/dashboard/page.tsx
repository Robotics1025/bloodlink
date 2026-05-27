export const dynamic = "force-dynamic"

import { OpenPostRequestBtn } from "@/components/open-post-request-btn"
import { QuickActionPostBtn } from "@/components/quick-action-post-btn"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  ClipboardList, Clock, CheckCircle, AlertTriangle,
  Droplet, Plus, ArrowRight, Building2, MapPin,
  ChevronRight, Activity,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { HospitalRequestChart } from "@/components/hospital-request-chart"

const BG: Record<string, string> = {
  A_POS: "A+", A_NEG: "A−", B_POS: "B+", B_NEG: "B−",
  AB_POS: "AB+", AB_NEG: "AB−", O_POS: "O+", O_NEG: "O−",
}
const BG_COLOR: Record<string, string> = {
  O_NEG: "bg-red-700",    O_POS: "bg-red-500",
  A_POS: "bg-slate-700",  A_NEG: "bg-slate-500",
  B_POS: "bg-rose-600",   B_NEG: "bg-rose-400",
  AB_POS: "bg-red-900",   AB_NEG: "bg-red-800",
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
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-200",
}

export default async function HospitalDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== "hospital") redirect("/login")

  const hospitalId = Number(session.user.id)

  const [hospital, requests, inventory] = await Promise.all([
    prisma.hospital.findUnique({
      where: { id: hospitalId },
      select: { hospitalName: true, location: true, status: true },
    }),
    prisma.bloodRequest.findMany({ where: { hospitalId }, orderBy: { createdAt: "desc" } }),
    prisma.inventory.findMany({ where: { hospitalId }, orderBy: { bloodGroup: "asc" } }),
  ])

  if (!hospital) redirect("/login")

  const totalRequests     = requests.length
  const pendingRequests   = requests.filter((r) => r.status === "PENDING").length
  const fulfilledRequests = requests.filter((r) => r.status === "FULFILLED" || r.status === "APPROVED").length
  const lowStockAlerts    = inventory.filter((i) => i.availableUnits <= 5).length
  const totalUnits        = inventory.reduce((s, i) => s + i.availableUnits, 0)
  const recentRequests    = requests.slice(0, 5)
  const fulfillRate       = totalRequests > 0 ? Math.round((fulfilledRequests / totalRequests) * 100) : 0
  const maxInv            = Math.max(...inventory.map((i) => i.availableUnits), 1)

  // Monthly chart data (last 6 months)
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const label = d.toLocaleDateString("en-US", { month: "short" })
    const inMonth = (r: { createdAt: Date }) => {
      const rd = new Date(r.createdAt)
      return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear()
    }
    return {
      month: label,
      requests: requests.filter(inMonth).length,
      fulfilled: requests.filter((r) => inMonth(r) && (r.status === "FULFILLED" || r.status === "APPROVED")).length,
    }
  })

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })

  return (
    <div className="flex flex-col gap-4">

      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl overflow-hidden text-white shadow-lg min-h-[130px]"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #7f1d1d 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(220,38,38,0.4)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M40 0L0 0 0 40' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")" }} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 pr-6">
          <div className="flex items-center gap-4">
            {/* Hospital icon badge */}
            <div className="w-14 h-14 rounded-xl bg-red-600 border border-red-500 flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-red-400 text-[10px] font-bold tracking-[3px] uppercase mb-0.5 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> Hospital Portal
              </p>
              <h1 className="text-xl font-extrabold leading-tight">{hospital.hospitalName}</h1>
              <p className="text-slate-400 text-xs mt-0.5 flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />{hospital.location} &nbsp;·&nbsp; {today}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold border select-none",
              hospital.status === "APPROVED"
                ? "bg-green-500/20 border-green-500/40 text-green-300"
                : "bg-amber-500/20 border-amber-500/40 text-amber-300"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse shrink-0",
                hospital.status === "APPROVED" ? "bg-green-400" : "bg-amber-400")} />
              {hospital.status}
            </div>
            <OpenPostRequestBtn />
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Total Requests", value: totalRequests,     Icon: ClipboardList, sub: "All time",                                          grad: "from-red-600 to-red-800",    ic: "text-red-100"   },
          { label: "Pending",        value: pendingRequests,   Icon: Clock,         sub: "Awaiting fulfillment",                              grad: "from-amber-500 to-orange-600", ic: "text-amber-100" },
          { label: "Fulfilled",      value: fulfilledRequests, Icon: CheckCircle,   sub: `${fulfillRate}% success rate`,                      grad: "from-green-600 to-emerald-700", ic: "text-green-100" },
          { label: "Low Stock",      value: lowStockAlerts,    Icon: AlertTriangle, sub: lowStockAlerts > 0 ? "⚠ Needs attention" : "Stock OK", grad: "from-slate-700 to-slate-900",  ic: "text-slate-200" },
        ].map(({ label, value, Icon, sub, grad, ic }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <div className={cn("h-16 w-full bg-gradient-to-br flex items-center justify-between px-4", grad)}>
              <Icon className={cn("w-7 h-7 opacity-90", ic)} />
              <p className={cn("text-3xl font-extrabold tabular-nums", ic)}>{value}</p>
            </div>
            <div className="px-3 py-2.5">
              <p className="text-xs font-bold text-slate-800">{label}</p>
              <p className="text-[10px] text-slate-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Requests trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Blood Request Trend</h2>
              <p className="text-xs text-slate-400">Last 6 months · requests vs fulfilled</p>
            </div>
            <Activity className="w-4 h-4 text-slate-300" />
          </div>
          <HospitalRequestChart data={monthlyData} />
        </div>

        {/* Fulfillment ring + units — stacked in one card */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-col gap-4">
          {/* Rate ring */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              <span className="text-sm font-bold text-slate-900">Fulfillment Rate</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                  <circle cx="50" cy="50" r="42" fill="none"
                    stroke={fulfillRate >= 70 ? "#16a34a" : fulfillRate >= 40 ? "#d97706" : "#dc2626"}
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - fulfillRate / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-slate-900 leading-none">{fulfillRate}%</span>
                  <span className="text-[9px] text-slate-400">rate</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className="text-xs text-slate-500">Fulfilled</span>
                  <span className="text-sm font-extrabold text-slate-900 ml-auto pl-4">{fulfilledRequests}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-xs text-slate-500">Pending</span>
                  <span className="text-sm font-extrabold text-slate-900 ml-auto pl-4">{pendingRequests}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                  <span className="text-xs text-slate-500">Total</span>
                  <span className="text-sm font-extrabold text-slate-900 ml-auto pl-4">{totalRequests}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Blood units */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
              <Droplet className="w-5 h-5 text-white fill-red-200" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Blood Units</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none">{totalUnits}</p>
              <p className="text-[10px] text-slate-400">{inventory.length} groups tracked</p>
            </div>
          </div>
          <Progress value={Math.min((totalUnits / 200) * 100, 100)} className="h-1.5 [&>div]:bg-red-500" />
        </div>
      </div>

      {/* ── Requests + Inventory ── */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Recent requests — takes 3 of 5 cols */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-900">Recent Blood Requests</span>
              <span className="text-[10px] text-slate-400 font-medium">· last {recentRequests.length}</span>
            </div>
            <Link href="/hospital/requests">
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs gap-1 font-semibold h-7 px-2">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="w-24 h-20 rounded-xl bg-slate-100 flex items-center justify-center">
                <ClipboardList className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-xs text-slate-400 font-medium">No blood requests yet</p>
              <Link href="/hospital/post-request">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white gap-1.5 h-7 text-xs">
                  <Plus className="w-3.5 h-3.5" />Post First Request
                </Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2">Blood</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-2">Units</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-2">Urgency</th>
                  <th className="text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-2">Date</th>
                  <th className="text-right text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2">
                      <span className={cn("inline-flex w-9 h-7 rounded-lg items-center justify-center text-white font-extrabold text-xs", BG_COLOR[req.bloodGroup] ?? "bg-slate-700")}>
                        {BG[req.bloodGroup]}
                      </span>
                    </td>
                    <td className="px-2 py-2 font-semibold text-slate-900 text-xs">{req.unitsRequired}</td>
                    <td className="px-2 py-2">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", URGENCY[req.urgencyLevel])}>{req.urgencyLevel}</span>
                    </td>
                    <td className="px-2 py-2 text-[11px] text-slate-400 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", STATUS[req.status])}>{req.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Inventory panel — takes 2 of 5 cols */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Inventory header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-slate-900">Blood Inventory</span>
            </div>
            <Link href="/hospital/inventory">
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 text-xs gap-1 font-semibold h-7 px-2">
                Manage <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {inventory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 px-4">
              <div className="w-20 h-16 rounded-lg bg-slate-100 flex items-center justify-center">
                <Droplet className="w-7 h-7 text-slate-300" />
              </div>
              <p className="text-xs text-slate-400 text-center">No inventory recorded yet.</p>
            </div>
          ) : (
            <div className="px-4 py-2 space-y-0 divide-y divide-slate-50">
              {inventory.map((item) => {
                const u = item.availableUnits
                const pct = Math.round((u / maxInv) * 100)
                const isLow = u <= 5
                const isMid = u > 5 && u <= 10
                return (
                  <div key={item.id} className="flex items-center gap-3 py-2">
                    <span className={cn("w-8 h-6 rounded flex items-center justify-center text-white text-[10px] font-extrabold shrink-0", BG_COLOR[item.bloodGroup] ?? "bg-slate-600")}>
                      {BG[item.bloodGroup]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <Progress
                        value={pct}
                        className={cn("h-1.5", isLow ? "[&>div]:bg-red-500" : isMid ? "[&>div]:bg-amber-400" : "[&>div]:bg-green-500")}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-600 shrink-0 w-12 text-right">{u} units</span>
                    {isLow && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 py-0.5 rounded border border-red-100 shrink-0">LOW</span>}
                  </div>
                )
              })}
              <div className="flex gap-3 pt-2 pb-1 text-[10px] text-slate-400">
                {[["bg-green-500",">10"],["bg-amber-400","6–10"],["bg-red-500","≤5"]].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1">
                    <span className={cn("w-2 h-2 rounded-full inline-block shrink-0", c)} />{l}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickActionPostBtn />
        {[
          { label: "View All Requests",  href: "/hospital/requests",    Icon: ClipboardList, style: "bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/20" },
          { label: "Manage Inventory",   href: "/hospital/inventory",   Icon: Droplet,       style: "bg-white hover:bg-red-50 border border-slate-200 text-slate-700 hover:border-red-200" },
          { label: "Hospital Profile",   href: "/hospital/profile",     Icon: Building2,     style: "bg-white hover:bg-red-50 border border-slate-200 text-slate-700 hover:border-red-200" },
        ].map(({ label, href, Icon, style }) => (
          <Link key={label} href={href}>
            <div className={cn("flex items-center gap-2.5 px-4 py-3 rounded-xl cursor-pointer transition-all", style)}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-bold leading-tight">{label}</span>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
