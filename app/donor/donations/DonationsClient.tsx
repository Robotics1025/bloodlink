"use client"

import { useState } from "react"
import { Droplet, Heart, Calendar, MapPin, Clock, ArrowRight, Droplets, Salad, AlarmClock } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSession } from "next-auth/react"

interface Donation {
  id: number
  type: string
  date: string
  time: string
  location: string
  status: string
}

interface DonationsClientProps {
  donations: Donation[]
  memberSince: string
}

const TABS = ["All Donations", "Whole Blood", "Platelets", "Plasma"]

const TIPS = [
  { icon: Droplets, title: "Stay Hydrated", desc: "Drink plenty of water before and after donating." },
  { icon: Salad,    title: "Eat Well",       desc: "Have a healthy meal before your donation." },
  { icon: AlarmClock, title: "Rest Enough", desc: "Get a good night's sleep before your donation." },
]

export function DonationsClient({ donations, memberSince }: DonationsClientProps) {
  const [activeTab, setActiveTab] = useState("All Donations")
  const { data: session } = useSession()
  const firstName = session?.user?.name?.split(" ")[0] || "Hero"

  const filtered = activeTab === "All Donations"
    ? donations
    : donations.filter((d) => d.type === activeTab)

  const wholeBloodCount = donations.filter((d) => d.type === "Whole Blood").length
  const plateletsCount  = donations.filter((d) => d.type === "Platelets").length
  const plasmaCount     = donations.filter((d) => d.type === "Plasma").length

  return (
    <div className="px-8 pb-8 max-w-[1200px] mx-auto w-full flex flex-col gap-6">

      {/* ── Banner ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#d32f2f] to-[#9a0007] text-white px-10 py-8 flex items-center justify-between shadow-md min-h-[190px]">
        {/* Decorative hearts */}
        <div className="absolute top-6 right-48 opacity-20">
          <Heart className="w-8 h-8 fill-white text-white" />
        </div>
        <div className="absolute bottom-8 right-60 opacity-15">
          <Heart className="w-5 h-5 fill-white text-white" />
        </div>

        <div className="relative z-10 flex flex-col gap-5">
          {/* Title */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold">My Donations</h1>
              <p className="text-red-200 text-sm mt-0.5">
                Track your donation history and see the impact you've made.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-10">
            <div className="flex items-center gap-3">
              <Droplet className="w-4 h-4 text-red-200" />
              <div>
                <p className="text-[11px] text-red-300 uppercase tracking-wider font-medium">Total Donations</p>
                <p className="text-2xl font-extrabold">{donations.length}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex items-center gap-3">
              <Heart className="w-4 h-4 text-red-200" />
              <div>
                <p className="text-[11px] text-red-300 uppercase tracking-wider font-medium">Lives Impacted</p>
                <p className="text-2xl font-extrabold">{donations.length * 3}</p>
              </div>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-red-200" />
              <div>
                <p className="text-[11px] text-red-300 uppercase tracking-wider font-medium">Member Since</p>
                <p className="text-2xl font-extrabold">{memberSince}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blood bag illustration */}
        <div className="relative z-10 hidden lg:flex items-center justify-center w-40 h-40 shrink-0">
          {/* Simple blood bag SVG */}
          <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="30" y="30" width="60" height="80" rx="12" fill="white" fillOpacity="0.25" stroke="white" strokeOpacity="0.6" strokeWidth="2"/>
            <rect x="42" y="50" width="36" height="45" rx="6" fill="white" fillOpacity="0.18"/>
            <rect x="42" y="70" width="36" height="25" rx="4" fill="white" fillOpacity="0.35"/>
            <line x1="60" y1="20" x2="60" y2="32" stroke="white" strokeOpacity="0.6" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="60" cy="18" r="4" fill="white" fillOpacity="0.6"/>
            <line x1="60" y1="110" x2="60" y2="125" stroke="white" strokeOpacity="0.6" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="60" cy="127" r="3" fill="white" fillOpacity="0.5"/>
          </svg>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left: Tab list ── */}
        <div className="lg:col-span-2 flex flex-col gap-0">

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-slate-200 mb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-3 text-sm font-semibold transition-colors border-b-2 -mb-px",
                  activeTab === tab
                    ? "border-[#CC0000] text-[#CC0000]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Donation Cards */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Droplet className="w-12 h-12 text-slate-200" />
                <p className="text-sm font-semibold text-slate-500">No donations found</p>
                <p className="text-xs text-slate-400">Try a different filter or donate to see your history.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {filtered.map((donation) => (
                  <div key={donation.id} className="flex items-center gap-5 px-6 py-5 hover:bg-slate-50/60 transition-colors group">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                      <Droplet className="w-5 h-5 text-red-500 fill-red-400" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900">{donation.type} Donation</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {donation.date}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {donation.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {donation.location}
                      </div>
                    </div>

                    {/* Status + arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-[11px] font-bold">
                        {donation.status}
                      </span>
                      <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Summary + Tips ── */}
        <div className="flex flex-col gap-5">

          {/* Donation Summary */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-5">Donation Summary</h3>

            <div className="flex items-center gap-6">
              {/* Custom SVG Donut */}
              <div className="relative w-20 h-20 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  {/* Background track */}
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                  {/* Whole blood (red) */}
                  <circle
                    cx="18" cy="18" r="15.9155" fill="none"
                    stroke="#CC0000" strokeWidth="3.5"
                    strokeDasharray={`${(wholeBloodCount / Math.max(donations.length,1)) * 100} 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-extrabold text-slate-900">{donations.length}</span>
                  <span className="text-[9px] text-slate-400 leading-none">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-2.5 text-sm">
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CC0000] shrink-0" />
                    <span className="text-slate-600 text-xs">Whole Blood</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{wholeBloodCount}</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shrink-0" />
                    <span className="text-slate-600 text-xs">Platelets</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{plateletsCount}</span>
                </div>
                <div className="flex items-center justify-between gap-8">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shrink-0" />
                    <span className="text-slate-600 text-xs">Plasma</span>
                  </div>
                  <span className="font-bold text-slate-900 text-xs">{plasmaCount}</span>
                </div>
              </div>
            </div>

            {/* Thank you card */}
            <div className="mt-5 bg-red-50 rounded-xl p-4 flex items-center gap-3 border border-red-100">
              <div className="w-9 h-9 rounded-full bg-[#CC0000] flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-white fill-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Thank you, {firstName}!</p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                  Your generosity is making a real difference in someone's life.
                </p>
              </div>
            </div>
          </div>

          {/* Donation Tips */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-5">Donation Tips</h3>
            <div className="flex flex-col gap-4">
              {TIPS.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-full bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
