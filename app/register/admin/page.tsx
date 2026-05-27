"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldSeparator,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Droplet, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react"

export default function AdminSignupPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    location: "",
    address: "",
    secretKey: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await fetch("/api/register/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "Registration failed. Check your Secret Key.")
      } else {
        router.push("/login")
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50">
      <div className="w-full max-w-sm md:max-w-4xl">
        <Card className="overflow-hidden p-0 shadow-xl border-0">
          <CardContent className="grid p-0 md:grid-cols-2">

            {/* ── LEFT: Form ── */}
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 mb-1">
                    <ShieldCheck className="h-5 w-5 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold">Admin Registration</h1>
                  <p className="text-balance text-muted-foreground text-sm">
                    Create a new Blood Link Administrator account
                  </p>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <Field>
                  <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                  <Input id="fullName" placeholder="Admin User" value={form.fullName} onChange={set("fullName")} required />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input id="email" type="email" placeholder="admin@example.com" value={form.email} onChange={set("email")} required />
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel>Location</FieldLabel>
                    <Select value={form.location} onValueChange={(v) => setForm(p => ({ ...p, location: v || "" }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select City" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kampala">Kampala</SelectItem>
                        <SelectItem value="Entebbe">Entebbe</SelectItem>
                        <SelectItem value="Jinja">Jinja</SelectItem>
                        <SelectItem value="Mbarara">Mbarara</SelectItem>
                        <SelectItem value="Gulu">Gulu</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="address">Address (P.O. Box)</FieldLabel>
                    <Input id="address" placeholder="P.O. Box 235" value={form.address} onChange={set("address")} required />
                  </Field>
                </div>

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
                  <FieldLabel htmlFor="secretKey">Admin Secret Key</FieldLabel>
                  <Input id="secretKey" type="password" placeholder="Required for registration" value={form.secretKey} onChange={set("secretKey")} required />
                  <FieldDescription>The default key is <code className="bg-muted px-1 rounded text-purple-600">bloodlink-admin-2026</code>.</FieldDescription>
                </Field>

                <Field>
                  <Button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                    {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating Account…</> : "Register as Admin"}
                  </Button>
                </Field>

                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  Already have an account?
                </FieldSeparator>

                <Field>
                  <Link href="/login">
                    <Button variant="outline" type="button" className="w-full">
                      Back to Login
                    </Button>
                  </Link>
                </Field>
              </FieldGroup>
            </form>

            {/* ── RIGHT: Branding ── */}
            <div className="relative hidden md:flex flex-col bg-slate-900 text-white p-8 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(124,58,237,0.25)_0%,_transparent_55%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(124,58,237,0.12)_0%,_transparent_55%)]" />

              <div className="relative flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600">
                  <Droplet className="h-4 w-4 fill-white text-white" />
                </div>
                <span className="font-bold text-base">Blood<span className="text-purple-400">Link</span></span>
              </div>

              <div className="relative mt-8 flex-1 flex flex-col justify-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold leading-snug">Administrator Access</h2>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                    Create your admin account to manage blood requests, mobilize donors, and oversee hospital inventory across the country.
                  </p>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
