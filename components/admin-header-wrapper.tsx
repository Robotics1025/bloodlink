"use client"

import { usePathname } from "next/navigation"
import { AdminHeader } from "@/components/admin-header"

const routeTitles: Record<string, string> = {
  "/admin/dashboard":     "Admin Dashboard",
  "/admin/donors":        "Manage Donors",
  "/admin/hospitals":     "Manage Hospitals",
  "/admin/inventory":     "Manage Inventory",
  "/admin/drives":        "Blood Drives",
  "/admin/notifications": "Notifications",
  "/admin/reports":       "Reports",
  "/admin/settings":      "Account Settings",
}

export function AdminHeaderWrapper() {
  const pathname = usePathname()
  const title = routeTitles[pathname] ?? "Admin Portal"
  return <AdminHeader title={title} />
}
