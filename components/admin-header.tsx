"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuGroup,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover"
import {
  Bell, Search, Settings, LogOut, User, Droplet, ShieldCheck,
  Clock, AlertTriangle, ChevronDown, Command, X,
  LayoutDashboard, Users, Hospital, Package, CalendarDays,
  BarChart2, ShieldPlus, FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAdminProfile } from "@/contexts/admin-profile-context"

/* ── Search catalogue ─────────────────────────────── */
const SEARCH_ITEMS = [
  { group: "Platform",       label: "Dashboard",        href: "/admin/dashboard",  Icon: LayoutDashboard },
  { group: "Platform",       label: "Manage Donors",    href: "/admin/donors",     Icon: Users           },
  { group: "Platform",       label: "Manage Hospitals", href: "/admin/hospitals",  Icon: Hospital        },
  { group: "Platform",       label: "Manage Inventory", href: "/admin/inventory",  Icon: Package         },
  { group: "Operations",     label: "Blood Drives",     href: "/admin/drives",     Icon: CalendarDays    },
  { group: "Operations",     label: "Notifications",    href: "/admin/notifications", Icon: Bell         },
  { group: "Operations",     label: "Reports",          href: "/admin/reports",    Icon: BarChart2       },
  { group: "Administration", label: "Settings",         href: "/admin/settings",   Icon: Settings        },
  { group: "Administration", label: "Create Admin",     href: "/admin/create-admin", Icon: ShieldPlus    },
]

const mockNotifications = [
  { id: 1, icon: AlertTriangle, color: "text-red-500 bg-red-50",    title: "Critical blood request",    desc: "O− needed at Nairobi General",                time: "2 min ago"  },
  { id: 2, icon: User,          color: "text-yellow-500 bg-yellow-50", title: "Hospital pending approval", desc: "Kenyatta Hospital submitted registration",  time: "18 min ago" },
  { id: 3, icon: Droplet,       color: "text-blue-500 bg-blue-50",  title: "Low stock alert",           desc: "AB+ units below threshold",                   time: "1 hr ago"   },
  { id: 4, icon: ShieldCheck,   color: "text-green-500 bg-green-50",title: "Blood request fulfilled",   desc: "A+ request #BR-044 completed",                time: "3 hr ago"   },
]

/* ── Search Overlay ───────────────────────────────── */
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)

  const results = query.trim()
    ? SEARCH_ITEMS.filter(s => s.label.toLowerCase().includes(query.toLowerCase()))
    : SEARCH_ITEMS

  // Auto-focus input
  useEffect(() => { inputRef.current?.focus() }, [])

  // Reset active index when results change
  useEffect(() => { setActive(0) }, [query])

  const navigate = useCallback((href: string) => {
    router.push(href)
    onClose()
  }, [router, onClose])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
    if (e.key === "ArrowUp")   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
    if (e.key === "Enter" && results[active]) navigate(results[active].href)
    if (e.key === "Escape") onClose()
  }, [results, active, navigate, onClose])

  // Group results
  const groups = results.reduce<Record<string, typeof SEARCH_ITEMS>>((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  // Flat index map for keyboard navigation
  let flatIdx = 0

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4"
      onClick={onClose}
    >
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl bg-background rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKey}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages, actions…"
            className="flex-1 text-sm bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
          />
          <div className="flex items-center gap-1.5">
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground bg-muted rounded border border-border">
              Esc
            </kbd>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors p-0.5 rounded hover:bg-muted">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto py-2">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <Search className="h-8 w-8 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No results for <span className="font-semibold">"{query}"</span></p>
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) => (
              <div key={group}>
                <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {group}
                </p>
                {items.map((item) => {
                  const idx = flatIdx++
                  return (
                    <button
                      key={item.href}
                      onMouseEnter={() => setActive(idx)}
                      onClick={() => navigate(item.href)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left",
                        active === idx ? "bg-red-50 text-red-700" : "hover:bg-muted/60 text-foreground"
                      )}
                    >
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0 transition-colors",
                        active === idx ? "bg-red-100" : "bg-muted"
                      )}>
                        <item.Icon className={cn("h-4 w-4", active === idx ? "text-red-600" : "text-muted-foreground")} />
                      </div>
                      <span className="font-medium">{item.label}</span>
                      {active === idx && (
                        <kbd className="ml-auto text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded border border-red-200 font-medium">
                          ↵ Enter
                        </kbd>
                      )}
                    </button>
                  )
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground bg-muted/30">
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted border border-border rounded">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted border border-border rounded">↵</kbd> open</span>
          <span className="flex items-center gap-1"><kbd className="px-1 py-0.5 bg-muted border border-border rounded">Esc</kbd> close</span>
        </div>
      </div>
    </div>
  )
}

/* ── Admin Header ─────────────────────────────────── */
interface AdminHeaderProps { title?: string }

export function AdminHeader({ title = "Admin Dashboard" }: AdminHeaderProps) {
  const { data: session } = useSession()
  const { profile: adminProfile } = useAdminProfile()
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [unread, setUnread] = useState(mockNotifications.length)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const displayName = adminProfile?.fullName ?? session?.user?.name ?? "Administrator"
  const displayRole = adminProfile?.role ?? session?.user?.role ?? "admin"
  const avatarUrl   = adminProfile?.avatarUrl ?? null
  const initials    = displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "AD"

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", fn, { passive: true })
    return () => window.removeEventListener("scroll", fn)
  }, [])

  // Global Ctrl+K / Cmd+K
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") { e.preventDefault(); setSearchOpen(true) }
    }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [])

  return (
    <>
      <header
        className={cn(
          "bl-dash-header sticky top-0 z-40 transition-all duration-300",
          scrolled ? "bg-background/95 backdrop-blur-md border-b border-border/60 shadow-sm" : "bg-background border-b border-transparent"
        )}
      >
        {/* Left */}
        <SidebarTrigger className="-ml-1 shrink-0" />
        <Separator orientation="vertical" className="mx-1 h-4 data-vertical:self-auto shrink-0" />
        <span className="text-sm font-semibold text-foreground hidden sm:block">{title}</span>

        {/* Centre — search trigger button */}
        <div className="flex-1 max-w-sm mx-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full flex items-center gap-2 h-8 px-3 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground text-sm transition-colors border border-transparent hover:border-border/50 text-left"
          >
            <Search className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-xs">Search…</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium bg-background rounded border border-border ml-auto shrink-0">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          </button>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 ml-auto">

          {/* Notifications */}
          <Popover open={notifOpen} onOpenChange={(o) => { setNotifOpen(o); if (o) setUnread(0) }}>
            <PopoverTrigger className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Bell className="h-4 w-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white leading-none pointer-events-none">
                  {unread}
                </span>
              )}
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 shadow-2xl rounded-xl">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h3 className="text-sm font-bold">Notifications</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{mockNotifications.length} alerts</span>
              </div>
              <ul className="divide-y max-h-72 overflow-y-auto">
                {mockNotifications.map(({ id, icon: Icon, color, title, desc, time }) => (
                  <li key={id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/40 cursor-pointer transition-colors">
                    <div className={cn("mt-0.5 shrink-0 p-1.5 rounded-lg", color)}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground">{title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{desc}</p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 flex items-center gap-0.5 mt-0.5">
                      <Clock className="h-2.5 w-2.5" />{time}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t px-4 py-2.5">
                <button onClick={() => router.push("/admin/notifications")} className="text-xs text-red-600 hover:text-red-700 font-semibold w-full text-center transition-colors">
                  View all notifications →
                </button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-muted/60 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer select-none">
              <Avatar className="h-7 w-7">
                {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />}
                <AvatarFallback className="bg-red-600 text-white text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start leading-none">
                <span className="text-xs font-semibold">{displayName}</span>
                <span className="text-[10px] text-muted-foreground capitalize">{displayRole}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 shadow-2xl rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {avatarUrl && <AvatarImage src={avatarUrl} alt={displayName} className="object-cover" />}
                      <AvatarFallback className="bg-red-600 text-white text-sm font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold">{displayName}</span>
                      <span className="text-xs text-muted-foreground">{adminProfile?.email ?? session?.user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => router.push("/admin/settings")} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search overlay — rendered outside header flow */}
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
    </>
  )
}
