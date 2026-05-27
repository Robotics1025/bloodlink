"use client"

import { Plus } from "lucide-react"
import { useHospitalLayout } from "@/contexts/hospital-layout-context"

export function QuickActionPostBtn() {
  const { setPostRequestOpen } = useHospitalLayout()
  return (
    <button
      onClick={() => setPostRequestOpen(true)}
      className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-900/20 transition-all"
    >
      <Plus className="w-4 h-4 shrink-0" />
      <span className="text-xs font-bold leading-tight">Post Blood Request</span>
    </button>
  )
}
