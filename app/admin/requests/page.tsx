"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { Search, Loader2, AlertTriangle, CheckCircle, XCircle, Droplet, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

const URGENCY_STYLES: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  URGENT: "bg-orange-100 text-orange-700 border-orange-200",
  NORMAL: "bg-blue-100 text-blue-700 border-blue-200",
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PARTIAL: "bg-orange-100 text-orange-700 border-orange-200",
  APPROVED: "bg-green-100 text-green-700 border-green-200",
  FULFILLED: "bg-green-100 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-700 border-gray-200",
}

export default function ManageRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [search, setSearch] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/requests")
      const data = await res.json()
      // Custom sort: PENDING/PARTIAL first, then ordered by urgency
      const sorted = data.sort((a: any, b: any) => {
        const isPendingA = a.status === "PENDING" || a.status === "PARTIAL" ? 1 : 0
        const isPendingB = b.status === "PENDING" || b.status === "PARTIAL" ? 1 : 0
        if (isPendingA !== isPendingB) return isPendingB - isPendingA
        const urgencyOrder = { CRITICAL: 3, URGENT: 2, NORMAL: 1 } as Record<string, number>
        const uA = urgencyOrder[a.urgencyLevel] || 0
        const uB = urgencyOrder[b.urgencyLevel] || 0
        if (uA !== uB) return uB - uA
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      })
      setRequests(sorted)
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const filtered = requests.filter(r => 
    !search || r.hospital.hospitalName.toLowerCase().includes(search.toLowerCase()) || r.bloodGroup.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async (id: number, action: "APPROVE" | "CANCEL") => {
    setProcessing(id)
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (data.error) alert(data.error)
      else await fetchData()
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Request Queue</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Prioritize and fulfill blood requests from hospitals.</p>
      </div>

      <Card className="shadow-xs">
        <CardHeader className="pb-4 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input placeholder="Search hospital or blood group…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="pl-6 text-xs">Hospital</TableHead>
                  <TableHead className="text-xs">Blood Group</TableHead>
                  <TableHead className="text-xs">Units</TableHead>
                  <TableHead className="text-xs">Urgency</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Requested At</TableHead>
                  <TableHead className="text-xs pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="py-16 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" /></TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-16 text-center"><Droplet className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" /><p>No requests found.</p></TableCell></TableRow>
                ) : filtered.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="pl-6 font-medium text-sm">{req.hospital.hospitalName}</TableCell>
                    <TableCell className="font-bold">{req.bloodGroup.replace("_POS", "+").replace("_NEG", "−")}</TableCell>
                    <TableCell>{req.unitsFulfilled} / {req.unitsRequired}</TableCell>
                    <TableCell><Badge variant="outline" className={`text-xs ${URGENCY_STYLES[req.urgencyLevel] || ""}`}>{req.urgencyLevel}</Badge></TableCell>
                    <TableCell><Badge variant="outline" className={`text-xs ${STATUS_STYLES[req.status] || ""}`}>{req.status}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(req.createdAt).toLocaleString()}</div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {(req.status === "PENDING" || req.status === "PARTIAL") && (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" className="h-8 text-green-700 hover:text-green-800" disabled={processing === req.id} onClick={() => handleAction(req.id, "APPROVE")}>
                            {processing === req.id ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <CheckCircle className="h-3 w-3 mr-1" />} Fulfill
                          </Button>
                          <Button size="sm" variant="outline" className="h-8 text-red-600 hover:text-red-700" disabled={processing === req.id} onClick={() => handleAction(req.id, "CANCEL")}>
                            <XCircle className="h-3 w-3 mr-1" /> Cancel
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
