"use client"

export const dynamic = 'force-dynamic'


import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Save, User, Heart, Phone, MapPin, Calendar } from "lucide-react"
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
        setPhone(data.phone)
        setLocation(data.location)
        setAvailability(data.availabilityStatus)
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
        <p className="text-sm text-gray-500">Could not load profile. Please refresh the page.</p>
      </div>
    )
  }

  const isDirty =
    phone !== profile.phone ||
    location !== profile.location ||
    availability !== profile.availabilityStatus ||
    lastDonationDate !==
      (profile.lastDonationDate
        ? new Date(profile.lastDonationDate).toISOString().split("T")[0]
        : "")

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">
          Keep your information up to date so hospitals can reach you when needed.
        </p>
      </div>

      {/* Identity Card */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <User className="w-4 h-4" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Full Name
              </label>
              <Input
                value={profile.fullName}
                readOnly
                disabled
                className="h-9 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email Address
              </label>
              <Input
                value={profile.email}
                readOnly
                disabled
                className="h-9 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
              <span className="text-red-700 font-bold text-sm">
                {bloodGroupLabel(profile.bloodGroup)}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Blood Group</p>
              <p className="text-sm font-semibold text-gray-900">{bloodGroupLabel(profile.bloodGroup)}</p>
            </div>
            <p className="text-xs text-gray-400 ml-auto">Cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      {/* Editable Information */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Donor Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" />
              Phone Number
            </label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +1 555 000 1234"
              className="h-9 text-sm"
            />
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              Location
            </label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nairobi, Kenya"
              className="h-9 text-sm"
            />
          </div>

          {/* Availability Toggle */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-gray-400" />
              Availability Status
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAvailability("AVAILABLE")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                  availability === "AVAILABLE"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                )}
              >
                ✓ Available to Donate
              </button>
              <button
                type="button"
                onClick={() => setAvailability("UNAVAILABLE")}
                className={cn(
                  "flex-1 py-2.5 px-4 rounded-lg border-2 text-sm font-medium transition-all",
                  availability === "UNAVAILABLE"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                )}
              >
                ✕ Not Available
              </button>
            </div>
            <p className="text-xs text-gray-400">
              {availability === "AVAILABLE"
                ? "Hospitals can notify you of matching blood requests."
                : "You won't receive blood request notifications while unavailable."}
            </p>
          </div>

          {/* Last Donation Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              Last Donation Date
            </label>
            <Input
              type="date"
              value={lastDonationDate}
              onChange={(e) => setLastDonationDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="h-9 text-sm"
            />
            <p className="text-xs text-gray-400">
              WHO guidelines recommend waiting at least 56 days between donations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center justify-between pb-4">
        {isDirty && (
          <p className="text-xs text-amber-600 font-medium">You have unsaved changes.</p>
        )}
        <div className={cn("ml-auto", !isDirty && "w-full flex justify-end")}>
          <Button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="bg-red-600 hover:bg-red-700 text-white px-6"
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
  )
}
