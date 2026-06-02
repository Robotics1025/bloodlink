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
  BarChart2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/donor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/donor/drives", label: "Find Drives", icon: HeartPulse },
  { href: "/donor/appointments", label: "Appointments", icon: Calendar },
  { href: "/donor/donations", label: "Donations", icon: Droplet },
  { href: "/donor/impact", label: "Impact", icon: BarChart2 },
  { href: "/donor/notifications", label: "Notifications", icon: Bell, badge: 2 },
  { href: "/donor/profile", label: "Profile", icon: User },
];

export function DonorSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full w-[260px] bg-white border-r border-slate-100 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex items-center justify-center w-8 h-8 rounded-full border border-red-100 bg-red-50">
          <Droplet className="w-4 h-4 text-red-600 fill-red-600" />
        </div>
        <div>
          <p className="font-bold text-slate-900 text-lg leading-none font-heading tracking-tight">
            Blood Link
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Donor Portal</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto pt-2">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <span
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#CC0000] text-white shadow-md shadow-red-900/10"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                  {label}
                </div>
                {badge ? (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#CC0000] text-white text-[10px] font-bold">
                    {badge}
                  </span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="px-4 py-6 mt-auto">
        {/* Impact Card */}
        <div className="bg-[#f8f9fa] rounded-2xl p-5 mb-6 text-center border border-slate-100">
          <div className="w-12 h-12 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-3">
            <div className="relative">
              <Droplet className="w-6 h-6 text-red-500 fill-red-500" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full flex items-center justify-center">
                <div className="w-1 h-1 bg-red-400 rounded-full" />
              </div>
            </div>
          </div>
          <p className="text-sm font-bold text-slate-800 leading-snug">
            Every donation<br />
            <span className="text-[#CC0000]">counts</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-1.5">
            Your single donation can save up to 3 lives.
          </p>
        </div>

        {/* Logout */}
        <button
          className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          Logout
        </button>
      </div>
    </div>
  );
}
