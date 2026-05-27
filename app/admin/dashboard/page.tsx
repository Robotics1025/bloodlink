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
  TrendingUpIcon,
  Users,
  Building2,
  ClipboardList,
  AlertTriangle,
} from "lucide-react"
import { AdminRequestChart } from "@/components/admin-request-chart"

function bloodGroupLabel(bg: string) {
  return bg.replace("_POS", "+").replace("_NEG", "−")
}

const urgencyColor: Record<string, string> = {
  CRITICAL: "bl-urgency-critical",
  URGENT:   "bl-urgency-urgent",
  NORMAL:   "bl-urgency-normal",
}
const statusColor: Record<string, string> = {
  PENDING:   "bl-status-pending",
  APPROVED:  "bl-status-approved",
  PARTIAL:   "bg-blue-100 text-blue-700 border-blue-200",
  FULFILLED: "bl-status-fulfilled",
  CANCELLED: "bl-status-cancelled",
}

export default async function AdminDashboardPage() {
  const [donorCount, hospitalCount, requestCount, lowStockCount, recentRequests, pendingHospitals, fulfilledCount] =
    await Promise.all([
      prisma.donor.count(),
      prisma.hospital.count({ where: { status: "APPROVED" } }),
      prisma.bloodRequest.count(),
      prisma.inventory.count({ where: { availableUnits: { lte: 5 } } }),
      prisma.bloodRequest.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { hospital: { select: { hospitalName: true } } },
      }),
      prisma.hospital.findMany({ where: { status: "PENDING" }, take: 5 }),
      prisma.bloodRequest.count({ where: { status: "FULFILLED" } }),
    ])

  const fulfillRate = requestCount > 0 ? Math.round((fulfilledCount / requestCount) * 100) : 0

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">

          {/* ── Section cards ── */}
          <div className="grid grid-cols-1 gap-4 px-4 lg:px-6
            *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5
            *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs
            @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> Total Donors
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {donorCount.toLocaleString()}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon className="size-3" />
                    Active
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="font-medium">Registered blood donors</div>
                <div className="text-muted-foreground">Available for emergency requests</div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5" /> Hospitals
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {hospitalCount.toLocaleString()}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon className="size-3" />
                    Approved
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="font-medium">Approved institutions</div>
                <div className="text-muted-foreground">
                  {pendingHospitals.length > 0
                    ? `${pendingHospitals.length} awaiting approval`
                    : "All hospitals reviewed"}
                </div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" /> Blood Requests
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                  {requestCount.toLocaleString()}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline">
                    <TrendingUpIcon className="size-3" />
                    {fulfillRate}% fulfilled
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="font-medium">Total requests submitted</div>
                <div className="text-muted-foreground">{fulfilledCount} successfully fulfilled</div>
              </CardFooter>
            </Card>

            <Card className="@container/card">
              <CardHeader>
                <CardDescription className="flex items-center gap-1.5">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Low Stock Alerts
                </CardDescription>
                <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-red-600">
                  {lowStockCount}
                </CardTitle>
                <CardAction>
                  <Badge variant="outline" className="border-red-200 text-red-600">
                    Critical
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardFooter className="flex-col items-start gap-1 text-sm">
                <div className="font-medium text-red-600">Inventory entries ≤ 5 units</div>
                <div className="text-muted-foreground">Requires immediate restocking</div>
              </CardFooter>
            </Card>
          </div>

          {/* ── Chart ── */}
          <div className="px-4 lg:px-6">
            <AdminRequestChart />
          </div>

          {/* ── Tables ── */}
          <div className="grid grid-cols-1 gap-6 px-4 lg:px-6 lg:grid-cols-3">

            {/* Recent blood requests */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Recent Blood Requests</CardTitle>
                <CardDescription>Latest requests across all hospitals</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40">
                      <TableHead className="pl-6 text-xs">Hospital</TableHead>
                      <TableHead className="text-xs">Blood</TableHead>
                      <TableHead className="text-xs">Units</TableHead>
                      <TableHead className="text-xs">Urgency</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-10">
                          No blood requests yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentRequests.map((req) => (
                        <TableRow key={req.id}>
                          <TableCell className="pl-6 font-medium text-sm">
                            {req.hospital.hospitalName}
                          </TableCell>
                          <TableCell>
                            <span className="bl-blood-chip">{bloodGroupLabel(req.bloodGroup)}</span>
                          </TableCell>
                          <TableCell className="text-sm">{req.unitsRequired}</TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${urgencyColor[req.urgencyLevel] ?? "bl-urgency-normal"}`}>
                              {req.urgencyLevel}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColor[req.status] ?? "bl-status-cancelled"}`}>
                              {req.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pending hospital approvals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Pending Approvals</CardTitle>
                  {pendingHospitals.length > 0 && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      {pendingHospitals.length}
                    </Badge>
                  )}
                </div>
                <CardDescription>Hospitals awaiting review</CardDescription>
              </CardHeader>
              <CardContent>
                {pendingHospitals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="text-2xl mb-2">✓</div>
                    <p className="text-sm">All hospitals reviewed</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {pendingHospitals.map((h) => (
                      <li key={h.id} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-100">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{h.hospitalName}</p>
                          <p className="text-xs text-muted-foreground truncate">{h.location}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(h.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-xs shrink-0">
                          PENDING
                        </Badge>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
    </div>
  )
}
