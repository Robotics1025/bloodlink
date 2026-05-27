import { Droplet, Heart, Building2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-svh bg-slate-50 flex flex-col items-center justify-center p-6">
      <Link href="/" className="flex items-center gap-2 mb-10">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600">
          <Droplet className="h-5 w-5 fill-white text-white" />
        </div>
        <span className="text-xl font-bold">Blood<span className="text-red-600">Link</span></span>
      </Link>

      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create an Account</h1>
        <p className="mt-2 text-gray-500">Choose how you want to join Blood Link</p>
      </div>

      <div className="w-full max-w-md grid gap-4">
        {/* Donor */}
        <Card className="border-2 border-red-100 hover:border-red-300 transition-colors shadow-sm cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900">Register as a Donor</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Receive emergency alerts matching your blood group and schedule donation appointments.
                </p>
                <Link href="/register/donor" className="mt-4 block">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white gap-2">
                    Sign Up as Donor <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hospital */}
        <Card className="border-2 border-blue-100 hover:border-blue-300 transition-colors shadow-sm cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-gray-900">Register a Hospital</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Post blood requests, manage inventory, and connect with donors in your area.
                </p>
                <Link href="/register/hospital" className="mt-4 block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    Sign Up as Hospital <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-red-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
