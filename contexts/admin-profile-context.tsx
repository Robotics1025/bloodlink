"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

interface AdminProfile {
  fullName: string
  email: string
  role: string
  avatarUrl?: string | null
}

interface AdminProfileContextValue {
  profile: AdminProfile | null
  refreshProfile: () => Promise<void>
  setAvatarUrl: (url: string) => void
}

const AdminProfileContext = createContext<AdminProfileContextValue>({
  profile: null,
  refreshProfile: async () => {},
  setAvatarUrl: () => {},
})

export function AdminProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<AdminProfile | null>(null)

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (!res.ok) return
      const data = await res.json()
      if (!data.error) setProfile(data)
    } catch {}
  }, [])

  const setAvatarUrl = useCallback((url: string) => {
    setProfile((prev) => prev ? { ...prev, avatarUrl: url } : prev)
  }, [])

  useEffect(() => { refreshProfile() }, [refreshProfile])

  return (
    <AdminProfileContext.Provider value={{ profile, refreshProfile, setAvatarUrl }}>
      {children}
    </AdminProfileContext.Provider>
  )
}

export function useAdminProfile() {
  return useContext(AdminProfileContext)
}
