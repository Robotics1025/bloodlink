export const dynamic = "force-dynamic"

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Award, Droplet, Heart, Users, Star, Sparkles, TrendingUp, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

export default async function ImpactPage() {
  const session = await auth()
  if (!session || session.user.role !== "donor") redirect("/login")

  const donorId = Number(session.user.id)

  const [donor, completedAppointments] = await Promise.all([
    prisma.donor.findUnique({ where: { id: donorId } }),
    prisma.appointment.findMany({
      where: { donorId, status: "COMPLETED" },
    })
  ])

  if (!donor) redirect("/login")

  const totalDonations = completedAppointments.length
  const livesImpacted = totalDonations * 3
  
  // Badge logic
  const getBadge = (count: number) => {
    if (count >= 10) return { name: "Lifesaver Elite", color: "bg-purple-100 text-purple-700 border-purple-200", icon: ShieldCheck }
    if (count >= 5)  return { name: "Gold Donor", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Award }
    if (count >= 1)  return { name: "Silver Donor", color: "bg-slate-200 text-slate-700 border-slate-300", icon: Star }
    return { name: "New Hero", color: "bg-green-100 text-green-700 border-green-200", icon: Sparkles }
  }

  const currentBadge = getBadge(totalDonations)
  const BadgeIcon = currentBadge.icon

  return (
    <div className="flex flex-col gap-6 px-8 pb-12 max-w-[1200px] mx-auto w-full">
      
      {/* ── Hero Banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#d32f2f] to-[#9a0007] text-white p-10 flex flex-col items-center text-center shadow-lg min-h-[280px] justify-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 2px, transparent 2px)', backgroundSize: '24px 24px' }}></div>
        <div className="absolute right-10 top-10 opacity-20 pointer-events-none scale-150 origin-center rotate-12">
           <Heart className="w-32 h-32 text-white fill-white" />
        </div>
        <div className="absolute left-10 bottom-10 opacity-20 pointer-events-none scale-125 origin-center -rotate-12">
           <Sparkles className="w-24 h-24 text-white fill-white" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl">
          <div className="w-16 h-16 rounded-full bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-sm mb-2 shadow-inner">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Your Impact</h1>
          <p className="text-red-100 text-sm sm:text-base font-medium">
            Every drop of blood you donate brings hope and life to those in need. See the incredible difference you are making in the community.
          </p>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-12 relative z-20 px-4">
        {/* Total Donations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex flex-col items-center text-center gap-2 transform transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-2">
            <Droplet className="w-6 h-6 text-red-500 fill-red-500" />
          </div>
          <p className="text-4xl font-extrabold text-slate-900">{totalDonations}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Donations</p>
        </div>

        {/* Lives Impacted */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex flex-col items-center text-center gap-2 transform transition-transform hover:-translate-y-1">
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mb-2">
            <Users className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-4xl font-extrabold text-slate-900">{livesImpacted}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lives Impacted</p>
        </div>

        {/* Current Tier */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl flex flex-col items-center text-center gap-2 transform transition-transform hover:-translate-y-1">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2", currentBadge.color.split(" ")[0])}>
            <BadgeIcon className={cn("w-6 h-6", currentBadge.color.split(" ")[1])} />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 leading-none">{currentBadge.name}</p>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Current Status</p>
        </div>
      </div>

      {/* ── Milestones & Achievements ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        
        {/* Left: Next Milestone */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 text-slate-900">
            <TrendingUp className="w-6 h-6 text-[#CC0000]" />
            <h2 className="text-xl font-bold">Your Journey</h2>
          </div>
          
          <p className="text-sm text-slate-500 leading-relaxed">
            You are on your way to becoming a top donor! Reaching milestones unlocks new community badges and special recognition in our donor hall of fame.
          </p>

          <div className="space-y-6 mt-4">
            {/* Milestone 1 */}
            <div className="relative">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-slate-400 fill-slate-300" /> 1 Donation
                </span>
                <span className="font-bold text-green-600 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Achieved</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full w-full rounded-full"></div>
              </div>
            </div>

            {/* Milestone 5 */}
            <div className="relative">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500 fill-amber-200" /> 5 Donations
                </span>
                <span className="font-bold text-slate-400">{Math.min(totalDonations, 5)} / 5</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((totalDonations/5)*100, 100)}%` }}></div>
              </div>
            </div>

            {/* Milestone 10 */}
            <div className="relative">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-500 fill-purple-200" /> 10 Donations
                </span>
                <span className="font-bold text-slate-400">{Math.min(totalDonations, 10)} / 10</span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((totalDonations/10)*100, 100)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: How It Helps */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3 text-slate-900">
            <Heart className="w-6 h-6 text-[#CC0000]" />
            <h2 className="text-xl font-bold">How Your Blood Helps</h2>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex gap-4 p-4 rounded-2xl border border-red-100 bg-red-50/30">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <Droplet className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Emergency Trauma</h4>
                <p className="text-xs text-slate-500 mt-1 leading-snug">Victims of accidents and burns often require massive blood transfusions to survive.</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-2xl border border-blue-100 bg-blue-50/30">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Cancer Treatments</h4>
                <p className="text-xs text-slate-500 mt-1 leading-snug">Patients undergoing chemotherapy need regular transfusions of platelets and red cells.</p>
              </div>
            </div>
            
            <div className="flex gap-4 p-4 rounded-2xl border border-purple-100 bg-purple-50/30">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Maternal Care</h4>
                <p className="text-xs text-slate-500 mt-1 leading-snug">Blood is critical for saving mothers suffering from severe complications during childbirth.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}
