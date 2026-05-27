"use client"

export const dynamic = "force-dynamic"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import {
  Save, Loader2, User, Lock, Eye, EyeOff,
  Shield, Mail, Calendar, Camera,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { useAdminProfile } from "@/contexts/admin-profile-context"

interface AdminProfile {
  id: number
  fullName: string
  email: string
  role: string
  avatarUrl?: string | null
  createdAt: string
}

type Tab = "profile" | "password"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const { setAvatarUrl: setContextAvatar, refreshProfile } = useAdminProfile()

  // Profile form
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [savingProfile, setSavingProfile] = useState(false)

  // Avatar
  const fileRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d && !d.error) {
          setProfile(d)
          setFullName(d.fullName)
          setEmail(d.email)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  // Handle avatar file pick + instant preview
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.")
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2 MB.")
      return
    }

    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (ev) => setAvatarPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    // Upload
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append("avatar", file)
      const res = await fetch("/api/admin/upload-avatar", { method: "POST", body: fd })
      const data = await res.json()
      if (data.error) { toast.error(data.error); setAvatarPreview(null); return }
      setProfile((prev) => prev ? { ...prev, avatarUrl: data.avatarUrl } : prev)
      setContextAvatar(data.avatarUrl)   // update header instantly
      toast.success("Profile picture updated!")
    } catch {
      toast.error("Upload failed. Please try again.")
      setAvatarPreview(null)
    } finally {
      setUploadingAvatar(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const saveProfile = async () => {
    if (!fullName.trim()) return toast.error("Full name cannot be empty.")
    if (!email.trim()) return toast.error("Email cannot be empty.")
    setSavingProfile(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      toast.success("Profile updated successfully!")
      setProfile((prev) => prev ? { ...prev, fullName, email } : prev)
      await refreshProfile()   // sync name/email in header
    } finally {
      setSavingProfile(false)
    }
  }

  const savePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error("All password fields are required.")
    if (newPassword !== confirmPassword)
      return toast.error("New passwords do not match.")
    if (newPassword.length < 6)
      return toast.error("Password must be at least 6 characters.")
    setSavingPassword(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.error) { toast.error(data.error); return }
      toast.success("Password changed successfully!")
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    } finally {
      setSavingPassword(false)
    }
  }

  const initials = profile?.fullName
    ? profile.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "AD"

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "—"

  const currentAvatar = avatarPreview ?? profile?.avatarUrl ?? null

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Account Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your admin profile, photo, and security preferences.</p>
      </div>

      {/* Profile Hero Card */}
      <div className="relative rounded-2xl overflow-hidden border border-border shadow-sm bg-card">
        {/* Banner */}
        <div
          className="h-28 relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #7f1d1d 100%)" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(220,38,38,0.35)_0%,_transparent_60%)]" />
          <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='40' height='40' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E\")" }} />
        </div>

        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-5">
            {/* Clickable avatar with camera overlay */}
            <div className="relative shrink-0 group">
              <Avatar className="h-[88px] w-[88px] border-4 border-background shadow-xl ring-2 ring-red-600/20">
                {currentAvatar ? (
                  <AvatarImage src={currentAvatar} alt={profile?.fullName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-red-600 text-white text-2xl font-extrabold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Upload overlay */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                {uploadingAvatar
                  ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                  : <Camera className="w-6 h-6 text-white" />
                }
              </button>
              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-foreground leading-tight">{profile?.fullName ?? "Administrator"}</h2>
              <p className="text-sm text-muted-foreground capitalize">{profile?.role ?? "Admin"}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Click photo to change</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: Mail,     label: "Email",        value: profile?.email ?? "—" },
              { icon: Shield,   label: "Role",         value: profile?.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1).toLowerCase() : "Admin" },
              { icon: Calendar, label: "Member Since", value: memberSince },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 bg-muted/40 hover:bg-muted/60 transition-colors rounded-xl px-4 py-3 border border-border/50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-600/10">
                  <Icon className="h-4 w-4 text-red-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="text-sm font-semibold text-foreground truncate">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs + Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* Sidebar tabs */}
        <div className="lg:col-span-1 flex lg:flex-col gap-1 bg-muted/40 rounded-xl p-1.5 border border-border">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 w-full text-left",
                activeTab === id
                  ? "bg-background text-slate-900 shadow-sm border border-border/60"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="lg:col-span-3">

          {/* Profile tab */}
          {activeTab === "profile" && (
            <div className="rounded-2xl border border-border shadow-sm bg-card p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-base font-bold text-foreground">Profile Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Update your display name and email address.</p>
              </div>
              <Separator />

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Full Name</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11"
                  />
                  <p className="text-[11px] text-muted-foreground">Changing email will update your login credentials.</p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={saveProfile}
                  disabled={savingProfile}
                  className="bg-red-600 hover:bg-red-700 text-white h-11 px-8 shadow-lg shadow-red-600/20 font-semibold"
                >
                  {savingProfile
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</>
                    : <><Save className="w-4 h-4 mr-2" />Save Profile</>
                  }
                </Button>
              </div>
            </div>
          )}

          {/* Password tab */}
          {activeTab === "password" && (
            <div className="rounded-2xl border border-border shadow-sm bg-card p-6 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div>
                <h3 className="text-base font-bold text-foreground">Change Password</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Use a strong password of at least 6 characters.</p>
              </div>
              <Separator />

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Current */}
                <div className="space-y-2 sm:col-span-2 max-w-md">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Current Password</label>
                  <div className="relative">
                    <Input type={showCurrent ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="h-11 pr-10" />
                    <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">New Password</label>
                  <div className="relative">
                    <Input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" className="h-11 pr-10" />
                    <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className={cn("h-1.5 flex-1 rounded-full transition-colors", newPassword.length >= (i + 1) * 3 ? "bg-red-600" : "bg-muted")} />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {newPassword.length < 6 ? "Too short" : newPassword.length < 9 ? "Moderate" : newPassword.length < 12 ? "Strong" : "Very strong"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirm New Password</label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      className={cn("h-11 pr-10", confirmPassword && confirmPassword !== newPassword && "border-red-400 focus-visible:ring-red-400")}
                    />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="text-[11px] text-red-500">Passwords do not match.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  onClick={savePassword}
                  disabled={savingPassword}
                  className="bg-slate-900 hover:bg-slate-800 text-white h-11 px-8 font-semibold"
                >
                  {savingPassword
                    ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Changing…</>
                    : <><Lock className="w-4 h-4 mr-2" />Change Password</>
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
