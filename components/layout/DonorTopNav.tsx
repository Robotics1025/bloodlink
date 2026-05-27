"use client"

import { useState } from "react"
import { Bell, Search, X, LogOut, User, HeartPulse } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export function DonorTopNav() {
  const { data: session } = useSession()
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const name     = session?.user?.name ?? "Donor"
  const initials = name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)

  return (
    <>
      <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 shrink-0 gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 flex-1 max-w-sm h-8 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-left">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 truncate">Search requests, drives…</span>
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="icon" className="relative h-8 w-8 text-slate-500 hover:bg-slate-100">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 pl-1 border-l border-slate-100 outline-none cursor-pointer rounded-lg px-2 py-1 hover:bg-slate-100 transition-colors">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-red-600 text-white font-bold text-xs">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:block leading-none text-left">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-[110px]">{name}</p>
                <p className="text-[10px] text-slate-400">Donor</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  <p className="text-xs font-bold text-slate-900 truncate">{name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{session?.user?.email ?? ""}</p>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/donor/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs">My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/donor/drives" className="flex items-center gap-2 cursor-pointer">
                    <HeartPulse className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs">Blood Drives</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" /><span className="text-xs font-semibold">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false) }}>
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input autoFocus value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blood requests, drives…"
                className="flex-1 text-sm outline-none text-slate-900 placeholder:text-slate-400" />
              <button onClick={() => setSearchOpen(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Quick Links</p>
              {[
                { label: "Blood Requests Near Me", href: "/donor/requests" },
                { label: "Upcoming Blood Drives",  href: "/donor/drives"   },
                { label: "My Appointments",        href: "/donor/appointments" },
                { label: "My Profile",             href: "/donor/profile"  },
              ].map(({ label, href }) => (
                <a key={href} href={href} onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 hover:text-red-700 text-sm text-slate-700 transition-colors">
                  <Search className="w-3.5 h-3.5 text-slate-300" />{label}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
