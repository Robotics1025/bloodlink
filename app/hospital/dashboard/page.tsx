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
  ChevronRight, Activity, Package, User,
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
    <div className="flex flex-col gap-5 p-2">

      {/* ── Welcome Banner ── */}
      <div className="relative rounded-2xl bg-gradient-to-r from-red-50/50 to-white border border-red-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-red-600 shadow-md flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-extrabold text-slate-900 leading-tight">{hospital.hospitalName}</h1>
                <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 gap-1 px-1.5 py-0 rounded-full text-[10px]">
                  <CheckCircle className="w-3 h-3" /> Verified
                </Badge>
              </div>
              <p className="text-slate-500 text-xs flex items-center gap-3">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{hospital.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{today}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 self-start sm:self-auto">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-orange-50 border-orange-200 text-orange-600">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-orange-500" />
                Pending
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border bg-green-50 border-green-200 text-green-600">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-green-500" />
                Operations Normal
              </div>
            </div>
            <Link href="/hospital/profile">
              <Button variant="outline" className="gap-2 font-semibold">
                <Building2 className="w-4 h-4" /> View Hospital Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Requests", value: totalRequests,     Icon: ClipboardList, sub: "All time",                                          bg: "bg-red-50", iconCol: "text-red-600" },
          { label: "Pending",        value: pendingRequests,   Icon: Clock,         sub: "Awaiting fulfillment",                              bg: "bg-orange-50", iconCol: "text-orange-500" },
          { label: "Fulfilled",      value: fulfilledRequests, Icon: CheckCircle,   sub: `${fulfillRate}% success rate`,                      bg: "bg-green-50", iconCol: "text-green-600" },
          { label: "Low Stock",      value: lowStockAlerts,    Icon: Droplet,       sub: lowStockAlerts > 0 ? "Needs attention" : "Stock OK", bg: "bg-red-50", iconCol: "text-red-600", subCol: "text-red-500" },
        ].map(({ label, value, Icon, sub, bg, iconCol, subCol }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("w-6 h-6", iconCol)} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 mb-1">{label}</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none mb-1">{value}</p>
              <p className={cn("text-[10px] font-medium", subCol || "text-slate-400")}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Requests trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Blood Request Trends</h2>
              <p className="text-xs text-slate-400">Last 6 months · Requests vs Fulfilled</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
               <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-red-600"></div> Requests</span>
               <span className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-red-400 border-t border-dashed"></div> Fulfilled</span>
            </div>
          </div>
          <HospitalRequestChart data={monthlyData} />
        </div>

        {/* Fulfillment ring */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-slate-900">Fulfillment Rate</h2>
          </div>
          
          <div className="flex items-center justify-between gap-4 flex-1">
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="50" cy="50" r="42" fill="none"
                  stroke="#16a34a"
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - fulfillRate / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-extrabold text-slate-900 leading-none">{fulfillRate}%</span>
                <span className="text-[10px] text-slate-500 font-medium">Fulfilled</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2 h-2 rounded-full bg-green-500" />Fulfilled</span>
                <span className="font-bold text-slate-900">{fulfilledRequests} <span className="text-slate-400 font-normal">({fulfillRate}%)</span></span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2 h-2 rounded-full bg-orange-400" />Pending</span>
                <span className="font-bold text-slate-900">{pendingRequests} <span className="text-slate-400 font-normal">({totalRequests ? Math.round(pendingRequests/totalRequests*100) : 0}%)</span></span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600 font-medium"><span className="w-2 h-2 rounded-full bg-red-500" />Unfulfilled</span>
                <span className="font-bold text-slate-900">{totalRequests - fulfilledRequests - pendingRequests} <span className="text-slate-400 font-normal">({totalRequests ? Math.round((totalRequests - fulfilledRequests - pendingRequests)/totalRequests*100) : 0}%)</span></span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
             <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
              <Droplet className="w-5 h-5 text-red-500 fill-red-200" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Total Blood Units</p>
              <p className="text-xl font-extrabold text-slate-900 leading-none">{totalUnits}</p>
              <p className="text-[10px] text-slate-400">Across all blood groups</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Requests + Inventory ── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

        {/* Recent requests */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-900">Recent Blood Requests</span>
            </div>
            <Link href="/hospital/requests">
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs gap-1 font-semibold h-7 px-2">
                View all <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-white">
                  <th className="text-[11px] font-semibold text-slate-500 px-5 py-3">Request ID</th>
                  <th className="text-[11px] font-semibold text-slate-500 px-2 py-3">Blood Type</th>
                  <th className="text-[11px] font-semibold text-slate-500 px-2 py-3">Units</th>
                  <th className="text-[11px] font-semibold text-slate-500 px-2 py-3">Urgency</th>
                  <th className="text-[11px] font-semibold text-slate-500 px-2 py-3">Status</th>
                  <th className="text-[11px] font-semibold text-slate-500 px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentRequests.map((req, i) => {
                  const urgencyStyle = req.urgencyLevel === "CRITICAL" ? "text-red-600 bg-red-50" : req.urgencyLevel === "URGENT" ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50";
                  const statusStyle = req.status === "PENDING" ? "text-orange-600 bg-orange-50" : "text-green-600 bg-green-50";
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3 text-xs font-medium text-slate-600">BRQ-2026-015{6-i}</td>
                      <td className="px-2 py-3">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                           <Droplet className="w-3 h-3 text-red-600 fill-red-600" /> {BG[req.bloodGroup]}
                        </span>
                      </td>
                      <td className="px-2 py-3 font-semibold text-slate-700 text-xs">{req.unitsRequired} {req.unitsRequired === 1 ? 'Unit' : 'Units'}</td>
                      <td className="px-2 py-3">
                        <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md", urgencyStyle)}>{req.urgencyLevel === "CRITICAL" ? "High" : req.urgencyLevel === "URGENT" ? "Medium" : "Low"}</span>
                      </td>
                      <td className="px-2 py-3">
                         <span className={cn("text-[10px] font-bold px-2 py-1 rounded-md", statusStyle)}>{req.status === "PENDING" ? "Pending" : "Fulfilled"}</span>
                      </td>
                      <td className="px-5 py-3 text-[11px] text-slate-500 font-medium">
                        {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Inventory panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-bold text-slate-900">Blood Inventory</span>
            </div>
            <Link href="/hospital/inventory">
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 text-xs gap-1 font-semibold h-7 px-2">
                Manage <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
             <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-white">
                    <th className="text-[11px] font-semibold text-slate-500 px-5 py-3">Blood Group</th>
                    <th className="text-[11px] font-semibold text-slate-500 px-2 py-3">Available Units</th>
                    <th className="text-[11px] font-semibold text-slate-500 px-2 py-3 w-1/3"></th>
                    <th className="text-[11px] font-semibold text-slate-500 px-5 py-3 text-right">Stock Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {inventory.slice(0, 5).map((item) => {
                    const u = item.availableUnits
                    const pct = Math.round((u / maxInv) * 100)
                    const isLow = u <= 5
                    const isMid = u > 5 && u <= 10
                    const barColor = isLow ? "bg-red-500" : isMid ? "bg-orange-400" : "bg-green-500";
                    const statusText = isLow ? "Critical" : isMid ? "Low" : "Good";
                    const statusColor = isLow ? "text-red-600" : isMid ? "text-orange-500" : "text-green-600";
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                         <td className="px-5 py-3">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                              <Droplet className="w-3 h-3 text-red-600 fill-red-600" /> {BG[item.bloodGroup]}
                            </span>
                         </td>
                         <td className="px-2 py-3 font-semibold text-slate-700 text-xs">{u} Units</td>
                         <td className="px-2 py-3">
                           <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className={cn("h-full rounded-full", barColor)} style={{ width: `${pct}%` }}></div>
                           </div>
                         </td>
                         <td className={cn("px-5 py-3 text-[11px] font-bold text-right", statusColor)}>
                           {statusText}
                         </td>
                      </tr>
                    )
                  })}
                </tbody>
             </table>
          </div>
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        <OpenPostRequestBtn className="h-auto p-0 border-0 shadow-none">
          <div className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md p-4 flex items-center gap-4 transition-colors w-full h-full text-left">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Droplet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Post Blood Request</p>
              <p className="text-[10px] text-red-100 font-medium">Create a new blood request</p>
            </div>
          </div>
        </OpenPostRequestBtn>
        
        {[
          { label: "View All Requests",  sub: "Browse and track requests", href: "/hospital/requests",    Icon: ClipboardList },
          { label: "Manage Inventory",   sub: "Update and manage stock", href: "/hospital/inventory",   Icon: Package },
          { label: "Hospital Profile",   sub: "View and edit hospital details", href: "/hospital/profile",     Icon: Building2 },
        ].map(({ label, sub, href, Icon }) => (
          <Link key={label} href={href}>
            <div className="bg-white border border-slate-200 hover:border-red-200 hover:shadow-md rounded-xl p-4 flex items-center gap-4 transition-all h-full">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-600">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{label}</p>
                <p className="text-[10px] text-slate-500 font-medium">{sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
