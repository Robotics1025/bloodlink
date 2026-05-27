"use client"

export const dynamic = 'force-dynamic'


import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { MapPin, Clock, Calendar, Heart, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BloodDrive {
  id: number
  title: string
  location: string
  date: string
  startTime: string
  endTime: string
  status: string
  description: string | null
}

export default function BloodDrivesPage() {
  const [drives, setDrives] = useState<BloodDrive[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDrive, setSelectedDrive] = useState<BloodDrive | null>(null)
  const [preferredTime, setPreferredTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const fetchDrives = useCallback(async () => {
    try {
      const res = await fetch("/api/donor/drives")
      if (res.ok) {
        const data = await res.json()
        setDrives(data)
      }
    } catch {
      toast.error("Failed to load blood drives")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDrives()
  }, [fetchDrives])

  const handleSchedule = async () => {
    if (!selectedDrive) return
    if (!preferredTime) {
      toast.error("Please select a preferred time")
      return
    }

    const driveDate = new Date(selectedDrive.date).toISOString().split("T")[0]

    setSubmitting(true)
    try {
      const res = await fetch("/api/donor/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodDriveId: selectedDrive.id,
          appointmentDate: driveDate,
          appointmentTime: preferredTime,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? "Failed to schedule appointment")
        return
      }
      toast.success("Appointment scheduled successfully!")
      setSelectedDrive(null)
      setPreferredTime("")
    } catch {
      toast.error("Something went wrong. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const openDialog = (drive: BloodDrive) => {
    const driveDate = new Date(drive.date)
    const now = new Date()
    if (driveDate < now) {
      toast.error("This blood drive has already passed.")
      return
    }
    setSelectedDrive(drive)
    setPreferredTime(drive.startTime)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Blood Drives</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find upcoming blood donation events and schedule your appointment.
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : drives.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Calendar className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-sm font-medium text-gray-500">No upcoming blood drives</p>
          <p className="text-xs text-gray-400 mt-1">New drives will be published here when available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {drives.map((drive) => {
            const driveDate = new Date(drive.date)
            const formattedDate = driveDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })
            const daysUntil = Math.ceil(
              (driveDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
            )
            return (
              <Card
                key={drive.id}
                className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-gray-900 leading-tight">
                      {drive.title}
                    </CardTitle>
                    <Badge className="bg-green-100 text-green-700 border border-green-300 text-xs shrink-0">
                      OPEN
                    </Badge>
                  </div>
                  {daysUntil <= 3 && (
                    <Badge className="mt-1 w-fit bg-orange-100 text-orange-700 border border-orange-300 text-xs">
                      {daysUntil === 0 ? "Today!" : daysUntil === 1 ? "Tomorrow!" : `In ${daysUntil} days`}
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{formattedDate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-green-500 shrink-0" />
                      <span>
                        {drive.startTime} – {drive.endTime}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{drive.location}</span>
                    </div>
                    {drive.description && (
                      <p className="text-xs text-gray-400 border-t border-gray-100 pt-2 leading-relaxed line-clamp-2">
                        {drive.description}
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => openDialog(drive)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="sm"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Schedule Appointment
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Schedule Appointment Dialog */}
      <Dialog
        open={!!selectedDrive}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDrive(null)
            setPreferredTime("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Schedule Appointment</DialogTitle>
            <DialogDescription className="text-sm text-gray-500">
              Confirm your appointment for{" "}
              <span className="font-medium text-gray-700">{selectedDrive?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {selectedDrive && (
            <div className="space-y-4 py-2">
              <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>
                    {new Date(selectedDrive.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{selectedDrive.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  <span>
                    Drive hours: {selectedDrive.startTime} – {selectedDrive.endTime}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Preferred Arrival Time
                </label>
                <Input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  min={selectedDrive.startTime}
                  max={selectedDrive.endTime}
                  className="h-9 text-sm"
                />
                <p className="text-xs text-gray-400">
                  Choose a time between {selectedDrive.startTime} and {selectedDrive.endTime}.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedDrive(null)
                setPreferredTime("")
              }}
              disabled={submitting}
              className="text-sm"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={submitting || !preferredTime}
              className="bg-red-600 hover:bg-red-700 text-white text-sm"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling…
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" />
                  Confirm Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
