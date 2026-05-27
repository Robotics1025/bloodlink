export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Droplet, Calendar, Bell, Heart, MapPin,
  Clock, HeartPulse, ArrowRight, CheckCircle,
  AlertTriangle, ChevronRight,
} from "lucide-react"
import { bloodGroupLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const URGENCY_STYLE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  URGENT:   "bg-orange-100 text-orange-700 border-orange-200",
  NORMAL:   "bg-slate-100 text-slate-600 border-slate-200",
}
const BG_COLOR: Record<string, string> = {
  O_NEG:  "bg-red-700",   O_POS:  "bg-red-500",
  A_POS:  "bg-slate-700", A_NEG:  "bg-slate-500",
  B_POS:  "bg-rose-600",  B_NEG:  "bg-rose-400",
  AB_POS: "bg-red-900",   AB_NEG: "bg-red-800",
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 17) return "Good afternoon"
  return "Good evening"
}

export default async function DonorDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== "donor") redirect("/login")

  const donorId = Number(session.user.id)

  const [donor, appointmentCount, unreadCount, nearbyRequests, upcomingDrives] = await Promise.all([
    prisma.donor.findUnique({ where: { id: donorId } }),
    prisma.appointment.count({ where: { donorId } }),
    prisma.notification.count({ where: { donorId, status: "UNREAD" } }),
    prisma.bloodRequest.findMany({
      where: { status: { in: ["PENDING", "PARTIAL"] } },
      include: { hospital: true },
      orderBy: [{ urgencyLevel: "asc" }, { createdAt: "desc" }],
      take: 5,
    }),
    prisma.bloodDrive.findMany({
      where: { status: "PUBLISHED", date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 3,
    }),
  ])

  if (!donor) redirect("/login")

  const firstName      = donor.fullName.split(" ")[0]
  const isAvailable    = donor.availabilityStatus === "AVAILABLE"
  const bloodLabel     = bloodGroupLabel(donor.bloodGroup)
  const criticalCount  = nearbyRequests.filter((r) => r.urgencyLevel === "CRITICAL").length

  return (
    <div className="flex flex-col gap-4">

      {/* ══ HERO BANNER ══ */}
      <div className="relative rounded-2xl overflow-hidden min-h-[150px] text-white shadow-lg"
        style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#7f1d1d 100%)" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,38,38,0.4)_0%,transparent_60%)]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M40 0L0 0 0 40' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")" }} />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            {/* Blood type badge */}
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center text-white font-extrabold text-2xl shadow-xl shrink-0 border-2 border-white/20",
              BG_COLOR[donor.bloodGroup] ?? "bg-red-600"
            )}>
              {bloodLabel}
            </div>
            <div>
              <p className="text-red-400 text-[10px] font-bold tracking-[3px] uppercase mb-0.5">Donor Portal</p>
              <h1 className="text-xl font-extrabold leading-tight">
                {greeting()}, {firstName}! 👋
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                Your blood type is <strong className="text-white">{bloodLabel}</strong> — you can save up to <strong className="text-white">3 lives</strong> per donation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {/* Availability pill */}
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold",
              isAvailable
                ? "bg-green-500/20 border-green-500/40 text-green-300"
                : "bg-slate-500/20 border-slate-500/40 text-slate-300"
            )}>
              <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                isAvailable ? "bg-green-400" : "bg-slate-400")} />
              {isAvailable ? "Available to Donate" : "Not Available"}
            </div>
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border bg-red-500/20 border-red-500/40 text-red-300 text-[11px] font-bold">
                <AlertTriangle className="w-3 h-3" />
                {criticalCount} Critical
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ KPI CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Blood Type",   value: bloodLabel,           sub: "Your blood group",
            Icon: Droplet,    grad: "from-red-600 to-red-800",      ic: "text-red-100",
          },
          {
            label: "Appointments", value: appointmentCount,     sub: "Donation sessions",
            Icon: Calendar,   grad: "from-slate-700 to-slate-900",  ic: "text-slate-200",
          },
          {
            label: "Blood Drives", value: upcomingDrives.length, sub: "Upcoming near you",
            Icon: HeartPulse, grad: "from-rose-600 to-rose-800",    ic: "text-rose-100",
          },
          {
            label: "Notifications", value: unreadCount,          sub: unreadCount > 0 ? `${unreadCount} unread` : "All caught up",
            Icon: Bell,       grad: "from-amber-500 to-orange-600", ic: "text-amber-100",
          },
        ].map(({ label, value, sub, Icon, grad, ic }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Gradient top bar */}
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

      {/* ══ IMPACT BANNER ══ */}
      <div className="bg-red-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-white shadow-md shadow-red-900/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-extrabold">Every drop matters.</p>
            <p className="text-[11px] text-red-200">There are {nearbyRequests.length} pending requests in your area right now.</p>
          </div>
        </div>
        <Link href="/donor/requests">
          <Button size="sm" className="bg-white text-red-600 hover:bg-red-50 font-bold gap-1.5 shrink-0 h-8 text-xs">
            See Requests <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>

      {/* ══ REQUESTS + DRIVES ══ */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">

        {/* Nearby requests — 3 cols */}
        <div className="xl:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-slate-900">Nearby Blood Requests</span>
              {criticalCount > 0 && (
                <span className="text-[10px] font-bold bg-red-100 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full">
                  {criticalCount} critical
                </span>
              )}
            </div>
            <Link href="/donor/requests">
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 text-xs gap-1 h-7 px-2 font-semibold">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {nearbyRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Droplet className="w-8 h-8 text-slate-200" />
              <p className="text-sm text-slate-400 font-medium">No pending requests right now</p>
              <p className="text-xs text-slate-300">Check back later — your community may need you.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {nearbyRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50/60 transition-colors">
                  {/* Blood badge */}
                  <div className={cn(
                    "w-11 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shrink-0",
                    BG_COLOR[req.bloodGroup] ?? "bg-slate-700"
                  )}>
                    {bloodGroupLabel(req.bloodGroup)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{req.hospital.hospitalName}</span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded border", URGENCY_STYLE[req.urgencyLevel])}>
                        {req.urgencyLevel}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                        <MapPin className="w-2.5 h-2.5" />{req.location}
                      </span>
                      <span className="text-[11px] text-slate-400">· {req.unitsRequired} units needed</span>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Blood drives — 2 cols */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-500" />
              <span className="text-sm font-bold text-slate-900">Upcoming Blood Drives</span>
            </div>
            <Link href="/donor/drives">
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 text-xs h-7 px-2 font-semibold gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>

          {upcomingDrives.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <Calendar className="w-8 h-8 text-slate-200" />
              <p className="text-xs text-slate-400 font-medium text-center">No upcoming drives.<br />Check back soon!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {upcomingDrives.map((drive) => (
                <div key={drive.id} className="px-4 py-3 hover:bg-slate-50/60 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-bold text-slate-900 leading-tight">{drive.title}</p>
                    <span className="text-[10px] font-bold bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded-full shrink-0">OPEN</span>
                  </div>
                  <div className="flex flex-col gap-1 text-[11px] text-slate-400 mb-2.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-red-400" />
                      {new Date(drive.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />{drive.startTime} – {drive.endTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-red-400" />{drive.location}
                    </span>
                  </div>
                  <Link href="/donor/drives">
                    <button className="w-full h-7 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-3 h-3" /> Schedule Appointment
                    </button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ QUICK ACTIONS ══ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "View Requests",    href: "/donor/requests",     Icon: Droplet,    style: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/20" },
          { label: "Blood Drives",     href: "/donor/drives",       Icon: HeartPulse, style: "bg-slate-900 hover:bg-slate-800 text-white shadow-md" },
          { label: "My Appointments",  href: "/donor/appointments", Icon: Calendar,   style: "bg-white hover:bg-red-50 border border-slate-200 text-slate-700 hover:border-red-200" },
          { label: "My Profile",       href: "/donor/profile",      Icon: Heart,      style: "bg-white hover:bg-red-50 border border-slate-200 text-slate-700 hover:border-red-200" },
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
