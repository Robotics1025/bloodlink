"use client"

import { useState } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { AlertCircle, CheckCircle, Clock, Droplet, Building2, Package, Bell, BarChart3, Loader2, ArrowRight, ArrowLeft, Eye, EyeOff } from "lucide-react"

export function HospitalSignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    hospitalName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    location: "",
    address: "",
    licenseNumber: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleNext = () => {
    if (step === 1 && (!form.hospitalName || !form.location || !form.address)) return toast.error("Please fill all fields in this step.");
    if (step === 2 && (!form.email || !form.phone)) return toast.error("Please fill all fields in this step.");
    setError(null)
    setStep(s => s + 1)
  }

  const handleBack = () => {
    setError(null)
    setStep(s => s - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.")
    setLoading(true)
    try {
      const res = await fetch("/api/register/hospital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalName: form.hospitalName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          location: `${form.location}, ${form.address}`,
          licenseNumber: form.licenseNumber,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Registration failed. Please try again.")
        setError(data.error ?? "Registration failed. Please try again.")
      } else {
        toast.success("Hospital registered successfully!")
        setSuccess(true)
      }
    } catch {
      toast.error("An unexpected error occurred.")
      setError("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl border-0">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[600px]">

          {/* ── LEFT: Form ── */}
          {success ? (
            <div className="flex flex-col items-center justify-center p-8 text-center gap-4 h-full">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e13a48]/10">
                <CheckCircle className="h-8 w-8 text-[#e13a48]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#0a1c35]">Registration Submitted!</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your hospital is under review by an administrator.
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700 w-full mt-4">
                <Clock className="h-5 w-5 shrink-0" />
                <span>Approval usually takes 1–2 business days.</span>
              </div>
              <Link href="/login" className="mt-4 w-full">
                <Button variant="outline" className="w-full h-12">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col p-8 h-full relative">
              <div className="flex flex-col items-center gap-2 text-center mb-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0a1c35] mb-2 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-2xl font-extrabold text-[#0a1c35]">Register Your Hospital</h1>
                <p className="text-balance text-muted-foreground text-sm">
                  Connect your facility to the Blood Link network
                </p>
              </div>

              {/* TIMELINE */}
              <div className="flex items-center justify-between mb-8 px-2 relative">
                <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -z-10 -translate-y-1/2 rounded-full" />
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-[#e13a48] -z-10 -translate-y-1/2 rounded-full transition-all duration-500"
                  style={{ width: `${((step - 1) / 2) * 100}%` }}
                />
                
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors duration-300 ${step >= s ? 'bg-[#e13a48] border-[#e13a48] text-white' : 'bg-white border-slate-200 text-slate-400'}`}>
                    {step > s ? <CheckCircle className="h-4 w-4" /> : s}
                  </div>
                ))}
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 mb-6">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between">
                <FieldGroup className="flex-1">
                  
                  {step === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                      <Field>
                        <FieldLabel htmlFor="hospitalName">Hospital Name</FieldLabel>
                        <Input id="hospitalName" placeholder="Mulago National Referral Hospital" value={form.hospitalName} onChange={set("hospitalName")} className="h-12" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="location">Location (City / District)</FieldLabel>
                        <Input id="location" placeholder="Kampala, Uganda" value={form.location} onChange={set("location")} className="h-12" required />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="address">Physical Address</FieldLabel>
                        <Input id="address" placeholder="Plot 42, Upper Mulago Hill Road" value={form.address} onChange={set("address")} className="h-12" required />
                      </Field>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                      <Field>
                        <FieldLabel htmlFor="email">Official Email Address</FieldLabel>
                        <Input id="email" type="email" placeholder="info@hospital.org" value={form.email} onChange={set("email")} className="h-12" required autoComplete="email" />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                        <Input id="phone" type="tel" placeholder="+256 700 000 000" value={form.phone} onChange={set("phone")} className="h-12" required />
                      </Field>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-500">
                      <Field>
                        <FieldLabel htmlFor="licenseNumber">License Number</FieldLabel>
                        <Input id="licenseNumber" placeholder="KNH-2024-001" value={form.licenseNumber} onChange={set("licenseNumber")} className="h-12" required />
                      </Field>
                      <div className="grid grid-cols-2 gap-4">
                        <Field>
                          <FieldLabel htmlFor="password">Password</FieldLabel>
                          <div className="relative">
                            <Input id="password" type={showPassword ? "text" : "password"} placeholder="Min 6 chars" value={form.password} onChange={set("password")} className="h-12 pr-10" required minLength={6} autoComplete="new-password" />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                          <div className="relative">
                            <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Repeat" value={form.confirmPassword} onChange={set("confirmPassword")} className="h-12 pr-10" required autoComplete="new-password" />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </Field>
                      </div>
                    </div>
                  )}

                </FieldGroup>

                <div className="mt-8 flex gap-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={handleBack} className="h-12 px-6">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                  {step < 3 ? (
                    <Button type="button" onClick={handleNext} className="h-12 flex-1 bg-[#0a1c35] hover:bg-[#0a1c35]/90 text-white font-semibold">
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={loading} className="h-12 flex-1 bg-[#e13a48] hover:bg-[#c9303d] text-white font-semibold shadow-lg shadow-[#e13a48]/30">
                      {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Submitting…</> : "Submit Registration"}
                    </Button>
                  )}
                </div>
                
                {step === 1 && (
                  <div className="mt-8 text-center text-sm text-slate-500">
                    Already registered? <Link href="/login" className="text-[#e13a48] font-semibold hover:underline">Sign In</Link>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* ── RIGHT: Branding panel ── */}
          <div className="relative hidden md:flex flex-col bg-[#0a1c35] text-white p-10 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(225,58,72,0.15)_0%,_transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(225,58,72,0.1)_0%,_transparent_55%)]" />

            {/* Logo */}
            <div className="relative flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e13a48] shadow-lg shadow-[#e13a48]/20">
                <Droplet className="h-5 w-5 fill-white text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight">Blood<span className="text-[#e13a48]">Link</span></span>
            </div>

            {/* Headline */}
            <div className="relative mt-12 flex-1 flex flex-col justify-center">
              <h2 className="text-3xl font-extrabold leading-tight">Connect Your<br />Hospital</h2>
              <p className="mt-4 text-[15px] text-slate-300 leading-relaxed">
                Access a verified network of donors and streamline your emergency blood supply chain today.
              </p>

              <div className="mt-10 space-y-6">
                {[
                  { icon: Bell, title: "Post Emergency Requests", desc: "Broadcast urgent blood needs to eligible donors immediately." },
                  { icon: Package, title: "Inventory Management", desc: "Track stock per blood group, expiry dates, and low-stock alerts." },
                  { icon: BarChart3, title: "Analytics & Reports", desc: "View request trends, fulfillment rates, and usage patterns." },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10 shadow-inner">
                      <Icon className="h-4 w-4 text-[#e13a48]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{title}</p>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative grid grid-cols-3 gap-4 border-t border-white/10 pt-8 mt-8">
              {[{ value: "150+", label: "Hospitals" }, { value: "2,400+", label: "Donors" }, { value: "5,800+", label: "Lives Saved" }].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-black text-[#e13a48]">{s.value}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-slate-500">
        By registering, you agree to our{" "}
        <Link href="/" className="font-semibold hover:text-[#e13a48] transition-colors">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/" className="font-semibold hover:text-[#e13a48] transition-colors">Privacy Policy</Link>.
      </FieldDescription>
    </div>
  )
}
