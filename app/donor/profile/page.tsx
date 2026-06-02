"use client"

export const dynamic = 'force-dynamic'


import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Loader2, Save, User, Heart, Phone, MapPin, Calendar, Info, Droplet, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { bloodGroupLabel } from "@/lib/utils"
import { toast } from "sonner"

interface DonorProfile {
  id: number
  fullName: string
  email: string
  phone: string
  bloodGroup: string
  location: string
  availabilityStatus: "AVAILABLE" | "UNAVAILABLE"
  lastDonationDate: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<DonorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [phone, setPhone] = useState("")
  const [location, setLocation] = useState("")
  const [availability, setAvailability] = useState<"AVAILABLE" | "UNAVAILABLE">("AVAILABLE")
  const [lastDonationDate, setLastDonationDate] = useState("")

  useEffect(() => {
    fetch("/api/donor/profile")
      .then((r) => r.json())
      .then((data: DonorProfile) => {
        setProfile(data)
        setPhone(data.phone || "")
        setLocation(data.location || "")
        setAvailability(data.availabilityStatus || "AVAILABLE")
        setLastDonationDate(
          data.lastDonationDate
            ? new Date(data.lastDonationDate).toISOString().split("T")[0]
            : ""
        )
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/donor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          location,
          availabilityStatus: availability,
          lastDonationDate: lastDonationDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to save profile")
        return
      }
      toast.success("Profile updated successfully")
      setProfile((prev) =>
        prev
          ? { ...prev, phone, location, availabilityStatus: availability, lastDonationDate }
          : prev
      )
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm text-slate-500">Could not load profile. Please refresh the page.</p>
      </div>
    )
  }

  const isDirty =
    phone !== (profile.phone || "") ||
    location !== (profile.location || "") ||
    availability !== profile.availabilityStatus ||
    lastDonationDate !==
      (profile.lastDonationDate
        ? new Date(profile.lastDonationDate).toISOString().split("T")[0]
        : "")

  return (
    <div className="flex flex-col gap-6 px-8 pb-12 max-w-[1200px] mx-auto w-full">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#d32f2f] to-[#9a0007] text-white p-8 flex items-center justify-between shadow-md min-h-[140px]">
        <div className="absolute right-10 bottom-0 opacity-20 pointer-events-none scale-150 origin-bottom-right">
           <User className="w-48 h-48 text-white fill-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-2">
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
             My Profile
          </h1>
          <p className="text-red-100 text-sm">
            Keep your information up to date so hospitals can reach you when needed.
          </p>
        </div>
        
        {isDirty && (
          <div className="relative z-10 hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30 text-white text-sm font-bold animate-pulse">
            <Info className="w-4 h-4" /> Unsaved changes
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Account Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col gap-5">
            <div className="flex items-center gap-2 text-slate-900 mb-2">
              <User className="w-5 h-5 text-[#CC0000]" />
              <h3 className="font-bold">Account Info</h3>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Full Name
              </label>
              <Input
                value={profile.fullName}
                readOnly
                disabled
                className="h-11 rounded-xl text-sm bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Email Address
              </label>
              <Input
                value={profile.email}
                readOnly
                disabled
                className="h-11 rounded-xl text-sm bg-slate-50 border-slate-100 text-slate-500 cursor-not-allowed font-medium"
              />
            </div>
            
            <div className="mt-2 bg-red-50/50 p-4 rounded-2xl border border-red-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white border border-red-200 flex items-center justify-center shrink-0">
                <span className="text-[#CC0000] font-extrabold text-lg">
                  {bloodGroupLabel(profile.bloodGroup)}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Blood Group</p>
                <p className="text-sm font-bold text-slate-900">{bloodGroupLabel(profile.bloodGroup)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editable Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-900">
                <Heart className="w-5 h-5 text-[#CC0000]" />
                <h3 className="font-bold">Donor Details</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number
                </label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +256 700 000000"
                  className="h-11 rounded-xl text-sm border-slate-200 focus-visible:ring-[#CC0000] font-medium"
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> Location
                </label>
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Kampala"
                  className="h-11 rounded-xl text-sm border-slate-200 focus-visible:ring-[#CC0000] font-medium"
                />
              </div>
            </div>

            {/* Last Donation Date */}
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Last Donation Date
              </label>
              <div className="sm:w-1/2">
                <Input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  className="h-11 rounded-xl text-sm border-slate-200 focus-visible:ring-[#CC0000] font-medium"
                />
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Info className="w-3 h-3" /> WHO recommends waiting at least 56 days between whole blood donations.
              </p>
            </div>

            {/* Availability */}
            <div className="space-y-3 pt-2">
              <label className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                <Droplet className="w-3.5 h-3.5 text-slate-400" /> Availability Status
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setAvailability("AVAILABLE")}
                  className={cn(
                    "flex-1 py-4 px-4 rounded-2xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2",
                    availability === "AVAILABLE"
                      ? "border-green-500 bg-green-50 text-green-700 shadow-sm shadow-green-500/20"
                      : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", availability === "AVAILABLE" ? "bg-green-500 animate-pulse" : "bg-slate-300")} />
                  Available to Donate
                </button>
                <button
                  type="button"
                  onClick={() => setAvailability("UNAVAILABLE")}
                  className={cn(
                    "flex-1 py-4 px-4 rounded-2xl border-2 text-sm font-bold transition-all flex items-center justify-center gap-2",
                    availability === "UNAVAILABLE"
                      ? "border-orange-500 bg-orange-50 text-orange-700 shadow-sm shadow-orange-500/20"
                      : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full", availability === "UNAVAILABLE" ? "bg-orange-500" : "bg-slate-300")} />
                  Not Available
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                {availability === "AVAILABLE"
                  ? "You will appear in searches and receive notifications for emergency blood requests."
                  : "You are currently hidden from urgent hospital requests."}
              </p>
            </div>
            
            {/* Action Bar */}
            <div className="mt-4 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm">
                {isDirty ? (
                  <span className="text-orange-600 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> You have unsaved changes.
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">Your profile is up to date.</span>
                )}
              </div>
              
              <Button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={cn(
                  "rounded-xl px-8 h-12 font-bold w-full sm:w-auto transition-all",
                  isDirty ? "bg-[#CC0000] hover:bg-red-700 text-white shadow-md shadow-red-900/20" : "bg-slate-100 text-slate-400 hover:bg-slate-100"
                )}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
