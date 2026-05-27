"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Droplet,
  Calendar,
  Bell,
  User,
  LogOut,
  HeartPulse,
  ClipboardList,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/donor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/donor/requests", label: "Blood Requests", icon: Droplet },
  { href: "/donor/drives", label: "Blood Drives", icon: HeartPulse },
  { href: "/donor/appointments", label: "Appointments", icon: Calendar },
  { href: "/donor/notifications", label: "Notifications", icon: Bell },
  { href: "/donor/profile", label: "Profile", icon: User },
];

export function DonorSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-64 bg-slate-900 text-white shrink-0">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
        <div className="flex items-center justify-center w-9 h-9 bg-red-600 rounded-lg">
          <Droplet className="w-5 h-5 text-white fill-white" />
        </div>
        <div>
          <p className="font-bold text-white text-sm font-heading">Blood Link</p>
          <p className="text-xs text-slate-400">Donor Portal</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href}>
            <span
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-red-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </span>
          </Link>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
