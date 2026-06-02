export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Droplet, Calendar, Bell, Heart, MapPin,
  Clock, HeartPulse, ArrowRight, CheckCircle,
  AlertTriangle, ChevronRight, Check, User
} from "lucide-react"
import { bloodGroupLabel } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default async function DonorDashboardPage() {
  const session = await auth()
  if (!session || session.user.role !== "donor") redirect("/login")

  const donorId = Number(session.user.id)

  const [donor, appointmentCount, upcomingDrives, completedAppointments] = await Promise.all([
    prisma.donor.findUnique({ where: { id: donorId } }),
    prisma.appointment.count({ where: { donorId } }),
    prisma.bloodDrive.findMany({
      where: { status: "PUBLISHED", date: { gte: new Date() } },
      orderBy: { date: "asc" },
      take: 1,
    }),
    prisma.appointment.findMany({
      where: { donorId, status: "COMPLETED" },
      orderBy: { appointmentDate: "desc" },
    })
  ])

  if (!donor) redirect("/login")

  const bloodLabel = bloodGroupLabel(donor.bloodGroup)
  const totalDonations = completedAppointments.length
  const livesImpacted = totalDonations * 3

  // Calculate Next Eligible Date (56 days after last donation)
  let nextEligibleDate = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  if (donor.lastDonationDate) {
    const lastDate = new Date(donor.lastDonationDate)
    nextEligibleDate = new Date(lastDate.getTime() + 56 * 24 * 60 * 60 * 1000)
    if (nextEligibleDate < today) nextEligibleDate = today
  } else if (completedAppointments.length > 0) {
    const lastDate = new Date(completedAppointments[0].appointmentDate)
    nextEligibleDate = new Date(lastDate.getTime() + 56 * 24 * 60 * 60 * 1000)
    if (nextEligibleDate < today) nextEligibleDate = today
  }

  const diffTime = Math.max(0, nextEligibleDate.getTime() - today.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const isEligible = diffDays === 0

  const progressGoal = Math.ceil((totalDonations + 1) / 5) * 5
  const progressPercent = totalDonations === 0 ? 0 : Math.round((totalDonations / progressGoal) * 100)

  return (
    <div className="flex flex-col gap-6 px-8 pb-8 max-w-[1200px] mx-auto w-full">
      
      {/* ══ KPI CARDS ══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blood Type */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Droplet className="w-6 h-6 text-red-600 fill-red-600" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Blood Type</p>
              <p className="text-3xl font-bold text-slate-900">{bloodLabel}</p>
            </div>
          </div>
          <span className={cn(
            "border px-3 py-1 rounded-full text-[10px] font-bold self-start mt-auto",
            isEligible ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
          )}>
            {isEligible ? "Eligible to donate" : "Ineligible right now"}
          </span>
        </div>

        {/* Card 2: Next Eligible */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Next Eligible</p>
              <p className="text-3xl font-bold text-slate-900 flex items-baseline gap-1">
                {isEligible ? "Now" : diffDays} {diffDays !== 0 && <span className="text-sm font-medium text-slate-500">days</span>}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-auto">
            {isEligible ? "You can donate today" : nextEligibleDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Card 3: Donations */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Donations</p>
              <p className="text-3xl font-bold text-slate-900 flex items-baseline gap-1">
                {totalDonations} <span className="text-sm font-medium text-slate-500">total</span>
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-auto">Keep it amazing!</p>
        </div>

        {/* Card 4: Lives Impacted */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <User className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 font-medium">Lives Impacted</p>
              <p className="text-3xl font-bold text-slate-900 flex items-baseline gap-1">
                {livesImpacted}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-auto">Thank you!</p>
        </div>
      </div>

      {/* ══ MIDDLE SECTION ══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banner (2 cols) */}
        <div className="lg:col-span-2 relative rounded-3xl overflow-hidden shadow-md bg-gradient-to-br from-[#d32f2f] to-[#9a0007] text-white p-8 min-h-[260px] flex flex-col justify-between">
          <div className="absolute right-0 bottom-0 opacity-20 pointer-events-none scale-150 origin-bottom-right">
             <Droplet className="w-64 h-64 text-white fill-white" />
          </div>
          <div className="relative z-10 flex flex-col gap-4">
            <span className="border border-white/40 text-white/90 rounded-full px-3 py-1 text-[10px] font-bold w-fit uppercase tracking-wider">
              Current Need
            </span>
            <div>
              <h2 className="text-4xl font-extrabold">{bloodLabel} Blood Needed</h2>
              <p className="text-red-100 mt-1">Your donation will help save lives.</p>
            </div>
            
            <div className="flex items-center gap-8 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/10">
                   <HeartPulse className="w-4 h-4" />
                </div>
                <p className="text-xs text-red-100 leading-tight">Managed by<br/><span className="text-white font-bold">Blood Link</span></p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/10">
                   <Calendar className="w-4 h-4" />
                </div>
                <p className="text-xs text-red-100 leading-tight">For hospital<br/><span className="text-white font-bold">requests</span></p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center bg-white/10">
                   <MapPin className="w-4 h-4" />
                </div>
                <p className="text-xs text-red-100 leading-tight">At collection<br/><span className="text-white font-bold">centers</span></p>
              </div>
            </div>
          </div>
          <div className="relative z-10 flex items-center gap-6 mt-4">
            <Link href="/donor/drives">
              <Button className="bg-white text-[#CC0000] hover:bg-slate-50 hover:text-red-700 rounded-full px-6 py-6 h-auto font-bold text-sm gap-2">
                Donate Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="#" className="text-sm font-medium hover:underline text-red-100">
              Learn more
            </Link>
          </div>
        </div>

        {/* Upcoming Drive (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Upcoming Drive</h3>
            <Link href="/donor/drives" className="text-xs font-bold text-[#CC0000] hover:underline">
              See all
            </Link>
          </div>
          
          {upcomingDrives.length > 0 ? (
            <div className="flex flex-col h-full justify-between">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 border border-red-100 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-100/50" />
                  <Heart className="w-10 h-10 text-red-500 fill-white relative z-10" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm font-bold text-slate-900 leading-tight">
                    {upcomingDrives[0].title}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(upcomingDrives[0].date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {upcomingDrives[0].startTime} – {upcomingDrives[0].endTime}
                  </div>
                  <div className="flex items-start gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{upcomingDrives[0].location}</span>
                  </div>
                </div>
              </div>
              <Link href="/donor/drives" className="mt-6 w-full">
                <Button className="w-full bg-[#CC0000] hover:bg-red-700 text-white rounded-xl py-6 h-auto font-bold text-sm">
                  Join Drive
                </Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <Calendar className="w-10 h-10 text-slate-200" />
              <p className="text-sm text-slate-500 font-medium">No upcoming drives</p>
            </div>
          )}
        </div>
      </div>

      {/* ══ BOTTOM SECTION ══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="flex items-center justify-around">
            <Link href="/donor/drives" className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                <Droplet className="w-6 h-6 text-red-500" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">Find Drives</span>
            </Link>
            <Link href="/donor/appointments" className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Calendar className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">Book<br/>Appointment</span>
            </Link>
            <Link href="/donor/donations" className="flex flex-col items-center gap-3 group">
              <div className="w-14 h-14 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <HeartPulse className="w-6 h-6 text-purple-500" />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center">Donation<br/>History</span>
            </Link>
          </div>
        </div>

        {/* Donation Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-6">Donation Progress</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="stroke-slate-100"
                  fill="none"
                  strokeWidth="3"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="stroke-[#CC0000]"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${progressPercent}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{progressPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 leading-tight">You're doing<br/>great!</p>
              <p className="text-xs text-slate-500 mt-2">Keep donating and making a difference.</p>
            </div>
          </div>
        </div>

        {/* Recent Donation */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Recent Donation</h3>
            <Link href="/donor/donations" className="text-xs font-bold text-[#CC0000] hover:underline">
              View all
            </Link>
          </div>
          
          {completedAppointments.length > 0 ? (
            <div className="mt-auto bg-green-50/50 rounded-2xl p-4 border border-green-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center shrink-0 shadow-md shadow-green-600/20">
                <Check className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{new Date(completedAppointments[0].appointmentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                <p className="text-[11px] text-slate-500">Whole Blood Donation</p>
              </div>
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-bold">
                Completed
              </span>
            </div>
          ) : (
            <div className="mt-auto flex flex-col items-center justify-center py-6 text-slate-400">
              <Droplet className="w-8 h-8 text-slate-200 mb-2" />
              <p className="text-xs font-medium">No donations yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
