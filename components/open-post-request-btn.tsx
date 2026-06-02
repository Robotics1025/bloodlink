"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useHospitalLayout } from "@/contexts/hospital-layout-context"

interface OpenPostRequestBtnProps {
  children?: React.ReactNode
  className?: string
  asChild?: boolean
}

export function OpenPostRequestBtn({ children, className, asChild }: OpenPostRequestBtnProps) {
  const { setPostRequestOpen } = useHospitalLayout()
  
  if (children) {
    return (
      <button 
        type="button"
        className={className}
        onClick={() => setPostRequestOpen(true)}
      >
        {children}
      </button>
    )
  }

  return (
    <Button size="sm" className={className || "bg-red-600 hover:bg-red-700 text-white gap-2 font-bold shadow-lg shadow-red-900/40"}
      onClick={() => setPostRequestOpen(true)}>
      <Plus className="w-4 h-4" />New Request
    </Button>
  )
}
