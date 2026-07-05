"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Image from "next/image"
import { AlertCircle, Droplet, Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react"

type Role = "donor" | "hospital" | "admin"

const ROLE_REDIRECT: Record<Role, string> = {
  donor: "/donor/dashboard",
  hospital: "/hospital/dashboard",
  admin: "/admin/dashboard",
}

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getUserRole = async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      const sessionRes = await fetch("/api/auth/session", { cache: "no-store" })
      const session = await sessionRes.json()
      const userRole = session?.user?.role

      if (userRole === "admin" || userRole === "hospital" || userRole === "donor") {
        return userRole
      }

      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 150))
      }
    }

    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const result = await signIn("credentials", { email, password, redirect: false })
      if (result?.error) {
        setError("Invalid email or password. Please try again.")
      } else {
        const userRole = await getUserRole()
        
        if (userRole === "admin") router.push("/admin/dashboard")
        else if (userRole === "hospital") router.push("/hospital/dashboard")
        else if (userRole === "donor") router.push("/donor/dashboard")
        else setError("Sign in succeeded, but we could not determine your account type. Please refresh and try again.")
        
        router.refresh()
      }
    } catch {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-xl border-0">
        <CardContent className="grid p-0 md:grid-cols-2">

          {/* ── LEFT: Form (exact login-04 layout) ── */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              {/* Header */}
              <div className="flex flex-col items-center gap-2 text-center relative">
                <Link href="/" className="absolute left-0 top-0 text-muted-foreground hover:text-foreground">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" title="Back to Home">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 mb-1">
                  <Droplet className="h-5 w-5 fill-white text-white" />
                </div>
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-balance text-muted-foreground text-sm">
                  Sign in to your Blood Link account
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}



              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </Field>

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Signing in…</>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                New to Blood Link?
              </FieldSeparator>

              {/* Register links */}
              <Field className="grid grid-cols-2 gap-3">
                <Link href="/register/donor">
                  <Button
                    variant="outline"
                    type="button"
                    className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Donor Sign Up
                  </Button>
                </Link>
                <Link href="/register/hospital">
                  <Button variant="outline" type="button" className="w-full text-xs">
                    Hospital Sign Up
                  </Button>
                </Link>
              </Field>
            </FieldGroup>
          </form>

          {/* ── RIGHT: Blood Link branding (replaces image placeholder) ── */}
          <div className="relative hidden md:flex flex-col bg-slate-900 text-white p-8 overflow-hidden">
            {/* Background glows */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(220,38,38,0.3)_0%,transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(220,38,38,0.15)_0%,transparent_55%)]" />

            {/* Top logo */}
            <div className="relative flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
                <Droplet className="h-4 w-4 fill-white text-white" />
              </div>
              <span className="font-bold text-base">
                Blood<span className="text-red-400">Link</span>
              </span>
            </div>

            {/* Hero image */}
            <div className="relative flex flex-1 items-center justify-center my-4">
              <div className="relative w-full h-52 rounded-2xl overflow-hidden ring-1 ring-red-500/20 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=600&q=80"
                  alt="Blood donation"
                  fill
                  className="object-cover object-center opacity-80"
                  unoptimized
                />
                <div className="absolute inset-0 bg-linear-to-t from-slate-900/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-xs font-semibold text-white/90 leading-snug">
                    Connecting donors &amp; hospitals across Uganda
                  </p>
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="relative space-y-4">
              <blockquote className="text-sm font-medium leading-relaxed text-slate-200">
                "Every second counts in an emergency. Blood Link connects donors and hospitals in real time."
              </blockquote>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 border-t border-slate-700 pt-4">
                {[
                  { value: "2,400+", label: "Donors" },
                  { value: "150+", label: "Hospitals" },
                  { value: "5,800+", label: "Lives Saved" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-lg font-bold text-red-400">{s.value}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By signing in, you agree to our{" "}
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/" className="underline underline-offset-4 hover:text-foreground">
          Privacy Policy
        </Link>.
      </FieldDescription>
    </div>
  )
}
