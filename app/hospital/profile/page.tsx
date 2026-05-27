"use client"

import { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Loader2, Mail, Phone, MapPin, FileText,
  Building2, Save, RotateCcw, ShieldCheck, Camera,
} from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface HospitalProfile {
  hospitalName: string
  email: string
  phone: string
  location: string
  licenseNumber: string
  status?: string
  avatarUrl?: string | null
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const fileRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile]     = useState<HospitalProfile | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [form, setForm] = useState({ hospitalName: "", phone: "", location: "", licenseNumber: "" })

  useEffect(() => {
    if (status !== "authenticated") return
    fetch("/api/hospital/profile")
      .then((r) => r.json())
      .then((data: HospitalProfile) => {
        setProfile(data)
        setAvatarUrl(data.avatarUrl ?? null)
        setForm({ hospitalName: data.hospitalName, phone: data.phone, location: data.location, licenseNumber: data.licenseNumber })
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false))
  }, [status])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2 MB"); return }
    setUploading(true)
    const fd = new FormData(); fd.append("avatar", file)
    try {
      const res = await fetch("/api/hospital/upload-avatar", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Upload failed"); return }
      setAvatarUrl(data.avatarUrl)
      toast.success("Profile picture updated!")
    } catch { toast.error("Upload failed") }
    finally { setUploading(false) }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.hospitalName.trim() || !form.location.trim()) {
      toast.error("Hospital name and location are required"); return
    }
    setSaving(true)
    try {
      const res = await fetch("/api/hospital/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to save"); return }
      toast.success("Profile updated!")
      setProfile((prev) => prev ? { ...prev, ...form } : prev)
    } catch { toast.error("Something went wrong") }
    finally { setSaving(false) }
  }

  const initials = profile?.hospitalName
    ? profile.hospitalName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "H"

  if (loading || status === "loading") {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-red-600" /></div>
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Page title ── */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Hospital Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">Update your hospital information and profile picture</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

        {/* ── LEFT column ── */}
        <div className="flex flex-col gap-4">

          {/* Profile card */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Banner */}
            <div className="relative h-24"
              style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#7f1d1d 100%)" }}>
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(220,38,38,0.35)_0%,transparent_65%)]" />
            </div>

            {/* Avatar — overlaps banner */}
            <div className="flex flex-col items-center -mt-10 pb-5 px-4">
              <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-red-600 flex items-center justify-center">
                  {avatarUrl ? (
                    <Image src={avatarUrl} alt="avatar" fill className="object-cover" />
                  ) : (
                    <span className="text-white font-extrabold text-2xl">{initials}</span>
                  )}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploading
                    ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                    : <Camera className="w-5 h-5 text-white" />}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />

              <div className="text-center mt-3">
                <h2 className="text-sm font-extrabold text-slate-900">{profile?.hospitalName ?? "—"}</h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{profile?.email}</p>
              </div>

              <div className={cn(
                "mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold",
                profile?.status === "APPROVED"
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              )}>
                <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse",
                  profile?.status === "APPROVED" ? "bg-green-500" : "bg-amber-500")} />
                {profile?.status ?? "PENDING"}
              </div>

              <p className="text-[10px] text-slate-400 mt-3">Click avatar to change picture</p>
            </div>
          </div>

          {/* Details strip */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-900">Account Info</span>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                { Icon: Building2,   label: "Type",        value: "Hospital"                    },
                { Icon: ShieldCheck, label: "Status",      value: profile?.status ?? "PENDING"  },
                { Icon: FileText,    label: "License",     value: profile?.licenseNumber || "—" },
                { Icon: MapPin,      label: "Location",    value: profile?.location || "—"      },
                { Icon: Phone,       label: "Phone",       value: profile?.phone || "—"         },
              ].map(({ Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-2.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400">{label}</p>
                    <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: edit form ── */}
        <form onSubmit={handleSave} className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-bold text-slate-900">Edit Information</span>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Hospital Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-3 h-3" /> Hospital Name <span className="text-red-500">*</span>
                </label>
                <Input value={form.hospitalName}
                  onChange={(e) => setForm(f => ({ ...f, hospitalName: e.target.value }))}
                  placeholder="e.g. Nairobi General Hospital"
                  className="focus-visible:ring-red-500 h-10" />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                  <span className="text-slate-300 font-normal normal-case">(read-only)</span>
                </label>
                <Input value={profile?.email ?? ""} readOnly disabled
                  className="bg-slate-50 text-slate-400 border-slate-100 h-10 cursor-not-allowed" />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone Number
                </label>
                <Input value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +254 712 345 678" type="tel"
                  className="focus-visible:ring-red-500 h-10" />
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Location <span className="text-red-500">*</span>
                </label>
                <Input value={form.location}
                  onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Nairobi, Kenya"
                  className="focus-visible:ring-red-500 h-10" />
              </div>

              {/* License */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3 h-3" /> License Number
                </label>
                <Input value={form.licenseNumber}
                  onChange={(e) => setForm(f => ({ ...f, licenseNumber: e.target.value }))}
                  placeholder="e.g. HOSP-2024-001"
                  className="focus-visible:ring-red-500 h-10" />
              </div>
            </div>

            <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/40">
              <p className="text-[11px] text-slate-400">Changes apply immediately after saving.</p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={saving}
                  className="gap-1.5 text-xs h-8"
                  onClick={() => profile && setForm({
                    hospitalName: profile.hospitalName, phone: profile.phone,
                    location: profile.location, licenseNumber: profile.licenseNumber,
                  })}>
                  <RotateCcw className="w-3 h-3" /> Reset
                </Button>
                <Button type="submit" size="sm" disabled={saving}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1.5 text-xs h-8 font-bold px-4">
                  {saving
                    ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</>
                    : <><Save className="w-3.5 h-3.5" /> Save Changes</>}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
