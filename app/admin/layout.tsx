import { SessionProvider } from "next-auth/react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AdminAppSidebar } from "@/components/admin-app-sidebar"
import { AdminHeaderWrapper } from "@/components/admin-header-wrapper"
import { AdminProfileProvider } from "@/contexts/admin-profile-context"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminProfileProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 64)",
            "--header-height": "calc(var(--spacing) * 14)",
          } as React.CSSProperties
        }
      >
        <AdminAppSidebar variant="inset" />
        <SidebarInset>
          <AdminHeaderWrapper />
          <div className="flex flex-1 flex-col overflow-y-auto">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
      </AdminProfileProvider>
    </SessionProvider>
  )
}

