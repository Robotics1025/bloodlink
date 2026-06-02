"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, PlusCircle, ClipboardList,
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
  const { data: session } = useSession();
  const { sidebarCollapsed, setPostRequestOpen } = useHospitalLayout();

  const name     = session?.user?.name ?? "Hospital Admin";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

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
            <TooltipTrigger
              render={
                <button
                  onClick={() => setPostRequestOpen(true)}
                  className="w-full flex items-center justify-center h-9 rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-white" />
                </button>
              }
            />
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

      {/* Main Nav */}
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
                <TooltipTrigger render={item} />
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }
          return item;
        })}

        {/* SYSTEM section */}
        {!sidebarCollapsed && (
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2.5 pt-4 pb-1">System</p>
        )}
        {sidebarCollapsed && <div className="border-t border-slate-700 my-2" />}

        {/* Notifications */}
        {[
          {
            href: "/hospital/notifications",
            label: "Notifications",
            badge: 3,
            icon: (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            ),
          },
          {
            href: "/hospital/help",
            label: "Help & Support",
            badge: 0,
            icon: (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
          },
        ].map(({ href, label, badge, icon }) => {
          const active = pathname === href;
          const item = (
            <Link key={href} href={href}>
              <span className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                sidebarCollapsed && "justify-center px-2",
                active ? "bg-red-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}>
                {icon}
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{label}</span>
                    {badge > 0 && (
                      <span className="bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                        {badge}
                      </span>
                    )}
                  </>
                )}
              </span>
            </Link>
          );
          if (sidebarCollapsed) {
            return (
              <Tooltip key={href}>
                <TooltipTrigger render={item} />
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          }
          return item;
        })}
      </nav>

      {/* User card */}
      {!sidebarCollapsed && (
        <div className="border-t border-slate-700 px-3 py-3">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center shrink-0 text-white font-bold text-xs">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{name}</p>
              <p className="text-[10px] text-slate-400 truncate">City Care Hospital</p>
            </div>
          </div>
        </div>
      )}

      {/* Logout */}
      <div className={cn("py-3 border-t border-slate-700", sidebarCollapsed ? "px-2" : "px-2")}>
        {sidebarCollapsed ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button variant="ghost" size="icon"
                  className="w-full text-slate-300 hover:text-white hover:bg-slate-800"
                  onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut className="w-4 h-4" />
                </Button>
              }
            />
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
