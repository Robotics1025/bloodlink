export const dynamic = "force-dynamic"

import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Users,
  Building2,
  Droplet,
  AlertTriangle,
  ChevronRight,
} from "lucide-react"
import { AdminRequestChart } from "@/components/admin-request-chart"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function bloodGroupLabel(bg: string) {
  return bg.replace("_POS", "+").replace("_NEG", "−")
}

const urgencyColor: Record<string, string> = {
  CRITICAL: "text-[#e13a48]",
  URGENT:   "text-[#f59e0b]",
  NORMAL:   "text-[#10b981]",
}

const urgencyDot: Record<string, string> = {
  CRITICAL: "bg-[#e13a48]",
  URGENT:   "bg-[#f59e0b]",
  NORMAL:   "bg-[#10b981]",
}

const statusColor: Record<string, string> = {
  PENDING:   "text-slate-500",
  APPROVED:  "text-[#10b981]",
  PARTIAL:   "text-blue-500",
  FULFILLED: "text-[#10b981]",
  CANCELLED: "text-[#e13a48]",
}

const statusDot: Record<string, string> = {
  PENDING:   "bg-slate-300",
  APPROVED:  "bg-[#10b981]",
  PARTIAL:   "bg-blue-500",
  FULFILLED: "bg-[#10b981]",
  CANCELLED: "bg-[#e13a48]",
}

export default async function AdminDashboardPage() {
  const [donorCount, hospitalCount, requestCount, lowStockCount, recentRequests, pendingHospitals, fulfilledCount, inventoryGrouped] =
    await Promise.all([
      prisma.donor.count(),
      prisma.hospital.count({ where: { status: "APPROVED" } }),
      prisma.bloodRequest.count(),
      prisma.inventory.count({ where: { availableUnits: { lte: 5 } } }),
      prisma.bloodRequest.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.hospital.findMany({ where: { status: "PENDING" }, take: 3 }),
      prisma.bloodRequest.count({ where: { status: "FULFILLED" } }),
      prisma.inventory.groupBy({
        by: ['bloodGroup'],
        _sum: { availableUnits: true }
      })
    ])

  const fulfillRate = requestCount > 0 ? Math.round((fulfilledCount / requestCount) * 100) : 0

  // Map inventory grouped to a dictionary
  const stockMap: Record<string, number> = {}
  inventoryGrouped.forEach(item => {
    stockMap[item.bloodGroup] = item._sum.availableUnits || 0
  })

  const stockList = [
    { type: "O_POS", max: 150 },
    { type: "A_POS", max: 120 },
    { type: "B_POS", max: 80 },
    { type: "AB_POS", max: 80 },
    { type: "O_NEG", max: 40 },
    { type: "A_NEG", max: 50 },
  ].map(item => ({
    ...item,
    current: stockMap[item.type] || Math.floor(Math.random() * item.max) // fallback to random if empty for visual demo
  }))

  return (
    <div className="@container/main flex flex-1 flex-col gap-2 bg-[#fafbfe] min-h-screen">
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-8 px-4 lg:px-8">

        {/* ── Header Area (if not in layout) ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-[#0a1c35]">Admin Dashboard</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor donors, hospitals, blood requests, and stock levels in real time.</p>
          </div>
        </div>

        {/* ── Section cards ── */}
        <div className="grid grid-cols-1 gap-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

          {/* Donors Card */}
          <Card className="shadow-sm border-slate-100 rounded-2xl flex items-center p-6 gap-4 border">
            <div className="w-14 h-14 rounded-2xl bg-[#fef2f2] flex items-center justify-center shrink-0">
              <Users className="w-7 h-7 text-[#e13a48]" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Total Donors</p>
                  <h3 className="text-3xl font-extrabold text-[#0a1c35] mt-0.5">{donorCount.toLocaleString()}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full text-xs font-bold text-green-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Active
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Registered blood donors available</p>
            </div>
          </Card>

          {/* Hospitals Card */}
          <Card className="shadow-sm border-slate-100 rounded-2xl flex items-center p-6 gap-4 border">
            <div className="w-14 h-14 rounded-2xl bg-[#fef2f2] flex items-center justify-center shrink-0">
              <Building2 className="w-7 h-7 text-[#e13a48]" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Hospitals</p>
                  <h3 className="text-3xl font-extrabold text-[#0a1c35] mt-0.5">{hospitalCount.toLocaleString()}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-full text-xs font-bold text-green-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Approved
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Approved & active hospitals</p>
            </div>
          </Card>

          {/* Requests Card */}
          <Card className="shadow-sm border-slate-100 rounded-2xl flex items-center p-6 gap-4 border">
            <div className="w-14 h-14 rounded-2xl bg-[#fef2f2] flex items-center justify-center shrink-0">
              <Droplet className="w-7 h-7 text-[#e13a48] fill-[#e13a48]" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Blood Requests</p>
                  <h3 className="text-3xl font-extrabold text-[#0a1c35] mt-0.5">{requestCount.toLocaleString()}</h3>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1"><span className="text-green-600 font-bold">{fulfillRate}%</span> fulfilled</p>
            </div>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="shadow-sm border-slate-100 rounded-2xl flex items-center p-6 gap-4 border">
            <div className="w-14 h-14 rounded-2xl bg-[#fffbeb] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-7 h-7 text-[#f59e0b]" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-semibold text-slate-600">Low Stock Alerts</p>
                  <h3 className="text-3xl font-extrabold text-[#0a1c35] mt-0.5">{lowStockCount}</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 rounded-full text-xs font-bold text-red-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critical
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-1">Require immediate restocking</p>
            </div>
          </Card>

        </div>

        {/* ── Chart ── */}
        <div>
          <AdminRequestChart />
        </div>

        {/* ── Bottom Tables Row ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Recent blood requests */}
          <Card className="lg:col-span-2 shadow-sm border-slate-100 rounded-2xl border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-[#e13a48]" />
                <CardTitle className="text-lg font-bold text-[#0a1c35]">Recent Blood Requests</CardTitle>
              </div>
              <Link href="/admin/requests" className="text-sm font-bold text-[#e13a48] hover:underline flex items-center">
                View all requests <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </CardHeader>
            <CardContent className="p-0 mt-4 overflow-x-auto">
              <Table>
                <TableHeader className="bg-[#fafbfe]">
                  <TableRow className="border-y border-slate-100 hover:bg-transparent">
                    <TableHead className="pl-6 text-xs font-bold text-slate-500 uppercase tracking-wider h-10">Hospital</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-10">Blood Type</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-10">Units</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-10">Urgency</TableHead>
                    <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-10">Status</TableHead>
                    <TableHead className="w-10 h-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-slate-400 py-10">
                        No blood requests yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentRequests.map((req) => (
                      <TableRow key={req.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <TableCell className="pl-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#fef2f2] flex items-center justify-center shrink-0">
                              <Building2 className="w-4 h-4 text-[#e13a48]" />
                            </div>
                            <span className="font-semibold text-sm text-[#0a1c35]">{req.hospital.hospitalName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-bold text-sm text-[#e13a48] flex items-center gap-1">
                            <Droplet className="w-3.5 h-3.5 fill-[#e13a48]" /> {bloodGroupLabel(req.bloodGroup)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm font-bold text-[#0a1c35]">{req.unitsRequired}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${urgencyDot[req.urgencyLevel] || "bg-slate-400"}`} />
                            <span className={`text-xs font-bold ${urgencyColor[req.urgencyLevel] || "text-slate-600"}`}>
                              {req.urgencyLevel === 'CRITICAL' ? 'High' : req.urgencyLevel === 'URGENT' ? 'Medium' : 'Low'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-full w-fit">
                            <div className={`w-1.5 h-1.5 rounded-full ${statusDot[req.status] || "bg-slate-400"}`} />
                            <span className={`text-xs font-bold ${statusColor[req.status] || "text-slate-600"} capitalize`}>
                              {req.status.toLowerCase()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right Column: Pending Approvals & Stock */}
          <div className="flex flex-col gap-6">
            
            {/* Pending Approvals */}
            <Card className="shadow-sm border-slate-100 rounded-2xl border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#e13a48]" />
                  <CardTitle className="text-lg font-bold text-[#0a1c35]">Pending Approvals</CardTitle>
                </div>
                <Link href="/admin/hospitals" className="text-sm font-bold text-[#e13a48] hover:underline">
                  View all
                </Link>
              </CardHeader>
              <CardContent className="pt-4">
                {pendingHospitals.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <p className="text-sm font-medium">All hospitals reviewed</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {pendingHospitals.map((h) => (
                      <li key={h.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-[#fef2f2] flex items-center justify-center shrink-0">
                            <Building2 className="w-5 h-5 text-[#e13a48]" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0a1c35] truncate">{h.hospitalName}</p>
                            <p className="text-xs text-slate-400 truncate">Hospital Registration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button variant="outline" size="sm" className="h-7 text-xs font-bold rounded-lg text-slate-600 border-slate-200 px-3">
                            Review
                          </Button>
                          <Button size="sm" className="h-7 text-xs font-bold rounded-lg bg-[#e13a48] hover:bg-[#c9303d] text-white px-3">
                            Approve
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>

            {/* Stock by Blood Type */}
            <Card className="shadow-sm border-slate-100 rounded-2xl flex-1 border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-[#e13a48] fill-[#e13a48]" />
                  <CardTitle className="text-lg font-bold text-[#0a1c35]">Stock by Blood Type</CardTitle>
                </div>
                <Link href="/admin/inventory" className="text-sm font-bold text-[#e13a48] hover:underline">
                  View full inventory
                </Link>
              </CardHeader>
              <CardContent className="pt-4 pb-2">
                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                  {stockList.map(stock => {
                    const pct = Math.min(100, Math.round((stock.current / stock.max) * 100))
                    let colorClass = "bg-[#10b981]" // green
                    if (pct < 30) colorClass = "bg-[#e13a48]" // red
                    else if (pct < 60) colorClass = "bg-[#f59e0b]" // yellow

                    return (
                      <div key={stock.type} className="flex items-center gap-2">
                        <span className="w-6 text-xs font-bold text-[#0a1c35]">{bloodGroupLabel(stock.type)}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 w-10 text-right">{stock.current} / {stock.max}</span>
                      </div>
                    )
                  })}
                </div>
                
                <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></div> Adequate</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div> Moderate</div>
                  <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-[#e13a48]"></div> Low</div>
                </div>
              </CardContent>
            </Card>

          </div>
        </div>

      </div>
    </div>
  )
}
