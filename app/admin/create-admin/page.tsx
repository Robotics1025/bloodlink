"use client"

export const dynamic = "force-dynamic"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, CheckCircle, Droplet, Eye, EyeOff, Loader2, ShieldCheck, UserPlus } from "lucide-react"

export default function CreateAdminPage() {
  const { data: session } = useSession()
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
    secretKey: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ email: string; role: string } | null>(null)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirmPassword) return setError("Passwords do not match.")
    setLoading(true)
    try {
      const res = await fetch("/api/admin/create-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          role: form.role,
          secretKey: form.secretKey,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Failed to create admin account.")
      } else {
        setSuccess({ email: data.admin.email, role: data.admin.role })
        setForm({ fullName: "", email: "", password: "", confirmPassword: "", role: "ADMIN", secretKey: "" })
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="w-full max-w-sm md:max-w-3xl">
        <Card className="overflow-hidden p-0 shadow-xl border-0">
          <CardContent className="grid p-0 md:grid-cols-2">

            {/* ── LEFT: Form ── */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 mb-1">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold">Create Admin Account</h1>
                  <p className="text-balance text-muted-foreground text-sm">
                    Add a new administrator to Blood Link
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-start gap-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2.5 text-sm text-green-700">
                    <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>
                      Admin <strong>{success.email}</strong> created successfully with role <strong>{success.role}</strong>.
                    </span>
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input id="fullName" placeholder="Admin User" value={form.fullName} onChange={set("fullName")} required />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input id="email" type="email" placeholder="admin@bloodlink.com" value={form.email} onChange={set("email")} required />
                </Field>

                <Field>
                  <FieldLabel>Admin Role</FieldLabel>
                  <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v ?? "ADMIN" }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                      <SelectItem value="MODERATOR">Moderator</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={form.password}
                      onChange={set("password")}
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                  <Input id="confirmPassword" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set("confirmPassword")} required />
                </Field>

                {/* Secret key — only needed if not already logged in as admin */}
                {!session && (
                  <Field>
                    <FieldLabel htmlFor="secretKey">
                      Admin Secret Key
                      <span className="ml-1.5 text-xs text-muted-foreground">(required without active session)</span>
                    </FieldLabel>
                    <Input id="secretKey" type="password" placeholder="Enter the system secret key" value={form.secretKey} onChange={set("secretKey")} />
                    <FieldDescription>
                      Set via <code className="text-xs bg-muted px-1 rounded">ADMIN_SECRET_KEY</code> environment variable.
                    </FieldDescription>
                  </Field>
                )}

                <Field>
                  <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Admin…</> : "Create Admin Account"}
                  </Button>
                </Field>
              </FieldGroup>
            </form>

            {/* ── RIGHT: Branding panel ── */}
            <div className="relative hidden md:flex flex-col bg-slate-900 text-white p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,58,237,0.25)_0%,_transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(124,58,237,0.12)_0%,_transparent_55%)]" />

              {/* Logo */}
              <div className="relative flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                  <Droplet className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="font-bold text-base">Blood<span className="text-purple-400">Link</span></span>
              </div>

              <div className="relative mt-8 flex-1 flex flex-col justify-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold leading-snug">Admin Account<br />Management</h2>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                    Create administrator accounts with different permission levels to manage the Blood Link platform.
                  </p>
                </div>

                {/* Role descriptions */}
                <div className="space-y-3">
                  {[
                    { badge: "Super Admin", color: "bg-purple-600", desc: "Full platform control — users, hospitals, inventory, settings." },
                    { badge: "Admin", color: "bg-purple-500", desc: "Manage donors, hospitals, drives, and notifications." },
                    { badge: "Moderator", color: "bg-purple-400", desc: "View reports and moderate blood requests only." },
                  ].map((r) => (
                    <div key={r.badge} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-600/20">
                        <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">{r.badge}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">{r.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg bg-slate-800/60 border border-slate-700 px-4 py-3 text-xs text-slate-400">
                  <p className="font-medium text-slate-300 mb-1">Default secret key</p>
                  <code className="text-purple-400">bloodlink-admin-2026</code>
                  <p className="mt-1.5">Override via <code className="text-slate-300">ADMIN_SECRET_KEY</code> in your <code className="text-slate-300">.env</code> file.</p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
