"use client"

export const dynamic = 'force-dynamic'


import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, TrendingUp, ClipboardList, CheckCircle, AlertCircle } from "lucide-react"

const BLOOD_GROUP_DISPLAY: Record<string, string> = {
  A_POS: "A+", A_NEG: "A−", B_POS: "B+", B_NEG: "B−",
  AB_POS: "AB+", AB_NEG: "AB−", O_POS: "O+", O_NEG: "O−",
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#EAB308",
  APPROVED: "#22C55E",
  PARTIAL: "#3B82F6",
  FULFILLED: "#10B981",
  CANCELLED: "#9CA3AF",
}

const URGENCY_COLORS: Record<string, string> = {
  CRITICAL: "#EF4444",
  URGENT: "#F97316",
  NORMAL: "#3B82F6",
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

interface BloodRequest {
  bloodGroup: string
  unitsRequired: number
  urgencyLevel: string
  status: string
  createdAt: string
}

function buildBarData(requests: BloodRequest[]) {
  const counts: Record<string, number> = {}
  for (const r of requests) {
    counts[r.bloodGroup] = (counts[r.bloodGroup] ?? 0) + 1
  }
  return Object.entries(counts).map(([bg, count]) => ({
    name: BLOOD_GROUP_DISPLAY[bg] ?? bg,
    count,
  }))
}

function buildMonthlyData(requests: BloodRequest[]) {
  const now = new Date()
  const months: { month: string; count: number; year: number; idx: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ month: MONTH_NAMES[d.getMonth()], count: 0, year: d.getFullYear(), idx: d.getMonth() })
  }
  for (const r of requests) {
    const d = new Date(r.createdAt)
    const m = months.find((x) => x.year === d.getFullYear() && x.idx === d.getMonth())
    if (m) m.count++
  }
  return months.map(({ month, count }) => ({ month, count }))
}

function buildPieData(requests: BloodRequest[]) {
  const counts: Record<string, number> = {}
  for (const r of requests) {
    counts[r.status] = (counts[r.status] ?? 0) + 1
  }
  return Object.entries(counts).map(([name, value]) => ({ name, value }))
}

export default function ReportsPage() {
  const { data: session, status } = useSession()
  const [requests, setRequests] = useState<BloodRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/hospital/reports")
      .then((r) => r.json())
      .then((data) => {
        setRequests(Array.isArray(data) ? data : [])
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false))
  }, [status])

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    )
  }

  const barData = buildBarData(requests)
  const monthlyData = buildMonthlyData(requests)
  const pieData = buildPieData(requests)

  const totalRequests = requests.length
  const approvedCount = requests.filter((r) =>
    r.status === "APPROVED" || r.status === "FULFILLED"
  ).length
  const pendingCount = requests.filter((r) => r.status === "PENDING").length
  const criticalCount = requests.filter((r) => r.urgencyLevel === "CRITICAL").length

  const approvalRate = totalRequests > 0
    ? Math.round((approvedCount / totalRequests) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">
          Visual insights into your blood request activity
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Requests",
            value: totalRequests,
            icon: ClipboardList,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
          },
          {
            label: "Approval Rate",
            value: `${approvalRate}%`,
            icon: TrendingUp,
            color: "text-green-600",
            bg: "bg-green-50",
            border: "border-green-200",
          },
          {
            label: "Pending",
            value: pendingCount,
            icon: CheckCircle,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
            border: "border-yellow-200",
          },
          {
            label: "Critical Requests",
            value: criticalCount,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50",
            border: "border-red-200",
          },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div
            key={label}
            className={`${bg} border ${border} rounded-xl p-4 flex items-center gap-4`}
          >
            <div className={`${bg} rounded-lg p-2 border ${border}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart — Requests by Blood Group */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Requests by Blood Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
                  <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #E5E7EB",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Requests" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart — Status Distribution */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-800">
              Request Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length === 0 ? (
              <div className="h-48 flex items-center justify-center text-sm text-gray-400">
                No data available
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={STATUS_COLORS[entry.name] ?? "#6B7280"}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2 text-xs">
                      <span
                        className="w-3 h-3 rounded-sm shrink-0"
                        style={{ backgroundColor: STATUS_COLORS[entry.name] ?? "#6B7280" }}
                      />
                      <span className="text-gray-600 flex-1">{entry.name}</span>
                      <span className="font-semibold text-gray-900">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Area Chart — Monthly Trend */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-800">
            Monthly Request Trend (Last 6 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#6B7280" }} />
              <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorCount)"
                name="Requests"
                dot={{ r: 4, fill: "#3B82F6" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
