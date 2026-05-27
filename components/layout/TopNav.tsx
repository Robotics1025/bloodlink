"use client";

import { useState } from "react";
import { Bell, PanelLeft, Search, X, LogOut, User, Settings } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useHospitalLayout } from "@/contexts/hospital-layout-context";
import Link from "next/link";

export function TopNav() {
  const { data: session } = useSession();
  const { toggleSidebar } = useHospitalLayout();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const name     = session?.user?.name ?? "Hospital";
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 gap-3">
        {/* Left */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Button variant="ghost" size="icon"
            className="h-8 w-8 shrink-0 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            onClick={toggleSidebar}>
            <PanelLeft className="w-4 h-4" />
          </Button>
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 flex-1 max-w-sm h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-left">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 truncate">Search requests, inventory…</span>
            <kbd className="ml-auto hidden sm:flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-white text-[10px] text-slate-400 font-mono shrink-0">⌘K</kbd>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 text-slate-500 hover:bg-slate-100">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
          </Button>

          {/* Avatar dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 pl-1 border-l border-slate-100 outline-none cursor-pointer rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-red-600 text-white font-bold text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block leading-none text-left">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">{name}</p>
                <p className="text-[10px] text-slate-400">Hospital</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{session?.user?.email ?? ""}</p>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/hospital/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">Hospital Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/hospital/inventory" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs">Manage Inventory</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}>
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests, blood groups, inventory…"
                className="flex-1 text-sm outline-none text-slate-900 placeholder:text-slate-400" />
              <button onClick={() => setSearchOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              {searchQuery.trim() === "" ? (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Quick Links</p>
                  {[
                    { label: "My Blood Requests", href: "/hospital/requests" },
                    { label: "Inventory Overview", href: "/hospital/inventory" },
                    { label: "Reports & Analytics", href: "/hospital/reports" },
                    { label: "Hospital Profile",    href: "/hospital/profile"  },
                  ].map(({ label, href }) => (
                    <a key={href} href={href} onClick={() => setSearchOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-700 text-sm text-slate-700 transition-colors">
                      <Search className="w-3.5 h-3.5 text-slate-300" />{label}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-6">
                  No results for <strong className="text-slate-600">&ldquo;{searchQuery}&rdquo;</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
