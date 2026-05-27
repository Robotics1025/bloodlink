import { DonorSignupForm } from "@/components/donor-signup-form"

export default function DonorRegisterPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-slate-50">
      <div className="w-full max-w-sm md:max-w-4xl">
        <DonorSignupForm />
      </div>
    </div>
  )
}
