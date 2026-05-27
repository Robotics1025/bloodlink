"use client"

export const dynamic = 'force-dynamic'


import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { Droplets, Loader2, CheckCircle2, XCircle, Search } from "lucide-react"
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

export default function PostRequestPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [bloodGroup, setBloodGroup] = useState("")
  const [unitsRequired, setUnitsRequired] = useState("")
  const [urgencyLevel, setUrgencyLevel] = useState("")
  const [reason, setReason] = useState("")
  const [location, setLocation] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingStock, setIsCheckingStock] = useState(false)
  const [inventoryResult, setInventoryResult] = useState<InventoryResult | null>(null)

  // Pre-fill location from session when available
  useEffect(() => {
    if (session?.user) {
      // Fetch hospital profile to get location
      fetch("/api/hospital/profile")
        .then((r) => r.json())
        .then((data) => {
          if (data.location) setLocation(data.location)
        })
        .catch(() => {})
    }
  }, [session])

  // Reset inventory check when blood group or units change
  useEffect(() => {
    setInventoryResult(null)
  }, [bloodGroup, unitsRequired])

  const handleCheckInventory = async () => {
    if (!bloodGroup) {
      toast.error("Please select a blood group first")
      return
    }
    setIsCheckingStock(true)
    setInventoryResult(null)
    try {
      const res = await fetch(`/api/hospital/inventory`)
      if (!res.ok) throw new Error("Failed to fetch inventory")
      const inventory: Array<{ bloodGroup: string; availableUnits: number }> = await res.json()
      const item = inventory.find((i) => i.bloodGroup === bloodGroup)
      const available = item?.availableUnits ?? 0
      const needed = Number(unitsRequired) || 0
      setInventoryResult({
        availableUnits: available,
        sufficient: needed > 0 ? available >= needed : available > 0,
      })
    } catch {
      toast.error("Could not fetch inventory data")
    } finally {
      setIsCheckingStock(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!bloodGroup || !unitsRequired || !urgencyLevel || !location) {
      toast.error("Please fill all required fields")
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/hospital/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodGroup,
          unitsRequired: Number(unitsRequired),
          urgencyLevel,
          reason: reason || undefined,
          location,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to post request")
        return
      }
      toast.success("Blood request posted successfully!")
      router.push("/hospital/requests")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-red-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Post Blood Request</h1>
        <p className="text-sm text-gray-500 mt-1">
          Submit a blood request to find matching donors and check available inventory.
        </p>
      </div>

      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4 border-b border-gray-100">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-red-500" />
            Request Details
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Blood Group + Inventory Check */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
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
                        <span className="font-semibold">{bg.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckInventory}
                  disabled={!bloodGroup || isCheckingStock}
                  className="shrink-0"
                >
                  {isCheckingStock ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">Check Stock</span>
                </Button>
              </div>

              {/* Inventory Check Result */}
              {inventoryResult !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border text-sm",
                    inventoryResult.sufficient
                      ? "bg-green-50 border-green-200 text-green-700"
                      : "bg-red-50 border-red-200 text-red-700"
                  )}
                >
                  {inventoryResult.sufficient ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    <strong>{inventoryResult.availableUnits} units</strong> available in inventory.{" "}
                    {inventoryResult.sufficient
                      ? "Sufficient stock — request will be approved immediately."
                      : "Insufficient stock — donors will be notified."}
                  </span>
                </div>
              )}
            </div>

            {/* Units Required */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Units Required <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min={1}
                max={100}
                value={unitsRequired}
                onChange={(e) => setUnitsRequired(e.target.value)}
                placeholder="e.g. 2"
                className="w-full"
              />
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <Select value={urgencyLevel} onValueChange={(v) => setUrgencyLevel(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  {URGENCY_LEVELS.map((ul) => (
                    <SelectItem key={ul.value} value={ul.value}>
                      {ul.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {urgencyLevel === "CRITICAL" && (
                <Badge className="bg-red-100 text-red-700 border-red-200 text-xs" variant="outline">
                  ⚡ Critical requests notify all matching donors immediately
                </Badge>
              )}
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Location <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. City Hospital, Nairobi"
                className="w-full"
              />
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Reason / Notes{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Emergency surgery scheduled for tomorrow morning..."
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 text-white h-10"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Posting Request...
                  </>
                ) : (
                  "Post Blood Request"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
