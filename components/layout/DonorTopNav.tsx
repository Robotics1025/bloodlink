"use client"

import { Bell, LogOut, User, HeartPulse, ChevronDown } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function DonorTopNav() {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  const name     = session?.user?.name ?? "Donor"
  const firstName = name.split(" ")[0]
  const initials = firstName.slice(0, 1).toUpperCase()
  // Assuming bloodGroup is available in session, otherwise default to A+
  // We can just hardcode A+ or try to get it if available
  const bloodGroup = (session?.user as any)?.bloodGroup ?? "A+"

  return (
    <header className="h-[100px] bg-transparent flex items-center justify-between px-8 shrink-0">
      <div className="flex flex-col pt-4">
        {pathname === "/donor/dashboard" ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Hi, {firstName}! <span className="text-2xl">👋</span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Thank you for being a lifesaver.
            </p>
          </>
        ) : (
          <h1 className="text-2xl font-bold text-slate-900 capitalize">
            {pathname.split("/").pop()?.replace("-", " ")}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-6 pt-4">
        {/* Notification Bell */}
        <button className="relative text-slate-600 hover:text-slate-900 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#CC0000] rounded-full border-2 border-[#f8f9fa] flex items-center justify-center text-white text-[9px] font-bold">
            2
          </span>
        </button>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-3 outline-none cursor-pointer group">
            <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
              <AvatarFallback className="bg-[#CC0000] text-white font-bold text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-[#CC0000] transition-colors">{firstName}</p>
              <div className="flex items-center gap-1 mt-1 text-slate-500">
                <p className="text-xs font-medium">{bloodGroup}</p>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
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
              <DropdownMenuItem
                render={
                  <Link href="/donor/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs">My Profile</span>
                  </Link>
                }
              />
              <DropdownMenuItem
                render={
                  <Link href="/donor/drives" className="flex items-center gap-2 cursor-pointer">
                    <HeartPulse className="w-3.5 h-3.5 text-slate-400" /><span className="text-xs">Blood Drives</span>
                  </Link>
                }
              />
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
  )
}
