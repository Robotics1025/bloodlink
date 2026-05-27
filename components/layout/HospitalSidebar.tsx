"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, PlusCircle, ClipboardList, Package,
  BarChart3, User, LogOut, Droplet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useHospitalLayout } from "@/contexts/hospital-layout-context";

const navItems = [
  { href: "/hospital/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/hospital/requests",   label: "My Requests", icon: ClipboardList },
  { href: "/hospital/reports",    label: "Reports",     icon: BarChart3 },
  { href: "/hospital/profile",    label: "Profile",     icon: User },
];

export function HospitalSidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, setPostRequestOpen } = useHospitalLayout();

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-900 text-white shrink-0 transition-all duration-300",
      sidebarCollapsed ? "w-[60px]" : "w-60"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center gap-3 border-b border-slate-700 shrink-0",
        sidebarCollapsed ? "px-0 py-4 justify-center" : "px-5 py-4"
      )}>
        <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-lg shrink-0">
          <Droplet className="w-4 h-4 text-white fill-white" />
        </div>
        {!sidebarCollapsed && (
          <div>
            <p className="font-bold text-white text-sm leading-none">Blood Link</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Hospital Portal</p>
          </div>
        )}
      </div>

      {/* Post Request Button */}
      <div className={cn("px-3 py-3 border-b border-slate-800", sidebarCollapsed && "px-2")}>
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setPostRequestOpen(true)}
                className="w-full flex items-center justify-center h-9 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
              >
                <PlusCircle className="w-4 h-4 text-white" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">Post Blood Request</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={() => setPostRequestOpen(true)}
            className="w-full flex items-center justify-center gap-2 h-9 rounded-lg bg-red-600 hover:bg-red-700 transition-colors text-white text-xs font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            Post Blood Request
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          const item = (
            <Link key={href} href={href}>
              <span className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                sidebarCollapsed && "justify-center px-2",
                active ? "bg-red-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}>
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && label}
              </span>
            </Link>
          );
          if (sidebarCollapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>{item}</TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }
          return item;
        })}
      </nav>

      {/* Logout */}
      <div className={cn("py-3 border-t border-slate-700", sidebarCollapsed ? "px-2" : "px-2")}>
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"
                className="w-full text-slate-300 hover:text-white hover:bg-slate-800"
                onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Logout</TooltipContent>
          </Tooltip>
        ) : (
          <Button variant="ghost"
            className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800 text-sm"
            onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}
