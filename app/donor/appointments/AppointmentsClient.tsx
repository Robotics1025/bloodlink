"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Clock, MapPin, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface Appointment {
  id: number
  bloodDriveTitle: string
  bloodDriveLocation: string
  appointmentDate: string
  appointmentTime: string
  status: string
}

function appointmentStatusStyle(status: string) {
  if (status === "CONFIRMED") return "bg-green-100 text-green-700 border border-green-300"
  if (status === "COMPLETED") return "bg-blue-100 text-blue-700 border border-blue-300"
  if (status === "CANCELLED") return "bg-gray-100 text-gray-500 border border-gray-200"
  return "bg-gray-100 text-gray-500 border border-gray-200"
}

export function AppointmentsClient({ appointments: initial }: { appointments: Appointment[] }) {
  const [appointments, setAppointments] = useState<Appointment[]>(initial)
  const [cancelling, setCancelling] = useState<number | null>(null)
  const router = useRouter()

  const handleCancel = async (id: number) => {
    setCancelling(id)
    try {
      const res = await fetch(`/api/donor/appointments/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to cancel appointment")
        return
      }
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "CANCELLED" } : a))
      )
      toast.success("Appointment cancelled")
      router.refresh()
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your blood donation appointments.
        </p>
      </div>

      {appointments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-500">No appointments yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Browse blood drives to schedule your first donation appointment.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 text-xs"
            onClick={() => (window.location.href = "/donor/drives")}
          >
            Browse Drives
          </Button>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="text-xs font-semibold text-gray-600 py-3">Blood Drive</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 py-3">Date</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 py-3">Time</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 py-3">Status</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 py-3 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appt) => (
                  <TableRow
                    key={appt.id}
                    className={cn(
                      "hover:bg-gray-50 transition-colors",
                      appt.status === "CANCELLED" && "opacity-60"
                    )}
                  >
                    <TableCell className="py-3">
                      <p className="text-sm font-medium text-gray-900 max-w-[200px] truncate">
                        {appt.bloodDriveTitle}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400 max-w-[180px] truncate">
                          {appt.bloodDriveLocation}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-sm text-gray-700">
                          {new Date(appt.appointmentDate).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-green-500" />
                        <span className="text-sm text-gray-700">{appt.appointmentTime}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <Badge className={cn("text-xs font-medium", appointmentStatusStyle(appt.status))}>
                        {appt.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      {appt.status === "CONFIRMED" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCancel(appt.id)}
                          disabled={cancelling === appt.id}
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {cancelling === appt.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <X className="w-3.5 h-3.5 mr-1" />
                              Cancel
                            </>
                          )}
                        </Button>
                      )}
                      {appt.status !== "CONFIRMED" && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
