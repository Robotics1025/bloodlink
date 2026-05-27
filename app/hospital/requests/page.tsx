export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { cn } from "@/lib/utils"
import { ClipboardList, CheckCircle, Clock, XCircle, Droplet, AlertTriangle } from "lucide-react"
import { RequestsClient } from "./requests-client"

const BG: Record<string, string> = {
  A_POS: "A+", A_NEG: "A−", B_POS: "B+", B_NEG: "B−",
  AB_POS: "AB+", AB_NEG: "AB−", O_POS: "O+", O_NEG: "O−",
}

export default async function RequestsPage() {
  const session = await auth()
  if (!session || session.user.role !== "hospital") redirect("/login")

  const hospitalId = Number(session.user.id)
  const requests = await prisma.bloodRequest.findMany({
    where: { hospitalId },
    orderBy: { createdAt: "desc" },
  })

  const total     = requests.length
  const pending   = requests.filter((r) => r.status === "PENDING").length
  const fulfilled = requests.filter((r) => r.status === "FULFILLED" || r.status === "APPROVED").length
  const cancelled = requests.filter((r) => r.status === "CANCELLED").length
  const critical  = requests.filter((r) => r.urgencyLevel === "CRITICAL" && r.status === "PENDING").length

  const serializable = requests.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt ? r.updatedAt.toISOString() : null,
    bgLabel: BG[r.bloodGroup] ?? r.bloodGroup,
  }))

  return (
    <div className="flex flex-col gap-4">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Blood Requests</h1>
          <p className="text-xs text-slate-400 mt-0.5">Track and manage all your blood requests</p>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: "Total",     value: total,     Icon: ClipboardList, color: "text-slate-600",  bg: "bg-slate-50" },
          { label: "Pending",   value: pending,   Icon: Clock,         color: "text-amber-600",  bg: "bg-amber-50" },
          { label: "Fulfilled", value: fulfilled, Icon: CheckCircle,   color: "text-green-600",  bg: "bg-green-50" },
          { label: "Cancelled", value: cancelled, Icon: XCircle,       color: "text-slate-400",  bg: "bg-slate-50" },
          { label: "Critical",  value: critical,  Icon: AlertTriangle, color: "text-red-600",    bg: "bg-red-50"   },
        ].map(({ label, value, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-2.5">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            <div>
              <p className={cn("text-lg font-extrabold leading-none tabular-nums", color)}>{value}</p>
              <p className="text-[10px] text-slate-400 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <RequestsClient requests={serializable} />
    </div>
  )
}
