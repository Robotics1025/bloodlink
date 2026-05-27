"use client"

import { createContext, useContext, useState } from "react"

interface HospitalLayoutCtx {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  postRequestOpen: boolean
  setPostRequestOpen: (v: boolean) => void
}

const HospitalLayoutContext = createContext<HospitalLayoutCtx>({
  sidebarCollapsed: false,
  toggleSidebar: () => {},
  postRequestOpen: false,
  setPostRequestOpen: () => {},
})

export function useHospitalLayout() {
  return useContext(HospitalLayoutContext)
}

export function HospitalLayoutProvider({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [postRequestOpen, setPostRequestOpen] = useState(false)

  return (
    <HospitalLayoutContext.Provider value={{
      sidebarCollapsed,
      toggleSidebar: () => setSidebarCollapsed((v) => !v),
      postRequestOpen,
      setPostRequestOpen,
    }}>
      {children}
    </HospitalLayoutContext.Provider>
  )
}
