"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import {
  Droplets, Loader2, CheckCircle2, XCircle, Search, Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

const BLOOD_GROUPS = [
  { label: "A+", value: "A_POS" },
  { label: "A−", value: "A_NEG" },
  { label: "B+", value: "B_POS" },
  { label: "B−", value: "B_NEG" },
  { label: "AB+", value: "AB_POS" },
  { label: "AB−", value: "AB_NEG" },
  { label: "O+", value: "O_POS" },
  { label: "O−", value: "O_NEG" },
]

const URGENCY_LEVELS = [
  { label: "Critical — Immediate need", value: "CRITICAL" },
  { label: "Urgent — Within 24 hours", value: "URGENT" },
  { label: "Normal — Within 3 days", value: "NORMAL" },
]

interface InventoryResult {
  availableUnits: number
  sufficient: boolean
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSuccess?: () => void
}

export function PostRequestSheet({ open, onOpenChange, onSuccess }: Props) {
  const router = useRouter()
  const { data: session } = useSession()

  const [bloodGroup, setBloodGroup] = useState("")
  const [unitsRequired, setUnitsRequired] = useState("")
  const [urgencyLevel, setUrgencyLevel] = useState("")
  const [reason, setReason] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingStock, setIsCheckingStock] = useState(false)
  const [inventoryResult, setInventoryResult] = useState<InventoryResult | null>(null)

  useEffect(() => {
    if (session?.user) {
      fetch("/api/hospital/profile")
        .then((r) => r.json())
        .then((data) => { if (data.location) setLocation(data.location) })
        .catch(() => {})
    }
  }, [session])

  useEffect(() => { setInventoryResult(null) }, [bloodGroup, unitsRequired])

  const reset = () => {
    setBloodGroup(""); setUnitsRequired(""); setUrgencyLevel("")
    setReason(""); setInventoryResult(null)
  }

  const handleCheckInventory = async () => {
    if (!bloodGroup) { toast.error("Select a blood group first"); return }
    setIsCheckingStock(true); setInventoryResult(null)
    try {
      const res = await fetch("/api/hospital/inventory")
      if (!res.ok) throw new Error()
      const inv: Array<{ bloodGroup: string; availableUnits: number }> = await res.json()
      const item = inv.find((i) => i.bloodGroup === bloodGroup)
      const available = item?.availableUnits ?? 0
      const needed = Number(unitsRequired) || 0
      setInventoryResult({ availableUnits: available, sufficient: needed > 0 ? available >= needed : available > 0 })
    } catch {
      toast.error("Could not fetch inventory")
    } finally {
      setIsCheckingStock(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bloodGroup || !unitsRequired || !urgencyLevel || !location) {
      toast.error("Please fill all required fields"); return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/hospital/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bloodGroup, unitsRequired: Number(unitsRequired), urgencyLevel, reason: reason || undefined, location }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || "Failed to post request"); return }
      toast.success("Blood request posted successfully!")
      reset()
      onOpenChange(false)
      onSuccess?.()
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-slate-900">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                <Droplets className="w-4 h-4 text-red-600" />
              </div>
              Post Blood Request
            </SheetTitle>
            <SheetDescription className="text-xs text-slate-400">
              Submit a new blood request. Matching donors will be notified.
            </SheetDescription>
          </SheetHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Blood Group */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Blood Group <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <Select value={bloodGroup} onValueChange={(v) => setBloodGroup(v ?? "")}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((bg) => (
                    <SelectItem key={bg.value} value={bg.value}>
                      <span className="font-bold">{bg.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" variant="outline" size="sm" onClick={handleCheckInventory}
                disabled={!bloodGroup || isCheckingStock} className="shrink-0 gap-1.5 h-9">
                {isCheckingStock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline text-xs">Check Stock</span>
              </Button>
            </div>
            {inventoryResult !== null && (
              <div className={cn("flex items-start gap-2 p-3 rounded-lg border text-xs mt-1",
                inventoryResult.sufficient ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700")}>
                {inventoryResult.sufficient
                  ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  : <XCircle className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>
                  <strong>{inventoryResult.availableUnits} units</strong> available.{" "}
                  {inventoryResult.sufficient ? "Sufficient — request approved immediately." : "Insufficient — donors will be notified."}
                </span>
              </div>
            )}
          </div>

          {/* Units Required */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Units Required <span className="text-red-500">*</span>
            </label>
            <Input type="number" min={1} max={100} value={unitsRequired}
              onChange={(e) => setUnitsRequired(e.target.value)} placeholder="e.g. 2" />
          </div>

          {/* Urgency */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Urgency Level <span className="text-red-500">*</span>
            </label>
            <Select value={urgencyLevel} onValueChange={(v) => setUrgencyLevel(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Select urgency level" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_LEVELS.map((ul) => (
                  <SelectItem key={ul.value} value={ul.value}>{ul.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {urgencyLevel === "CRITICAL" && (
              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs" variant="outline">
                ⚡ Notifies all matching donors immediately
              </Badge>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Location <span className="text-red-500">*</span>
            </label>
            <Input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              placeholder="Hospital location / ward" />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Reason <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief description of need..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Post Request
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
