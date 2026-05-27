import { HospitalSignupForm } from "@/components/hospital-signup-form"

export default function HospitalRegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50">
      <div className="w-full max-w-sm md:max-w-4xl">
        <HospitalSignupForm />
      </div>
    </div>
  )
}
