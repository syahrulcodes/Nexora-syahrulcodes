"use client"

import { useAppStore } from "@/store/useAppStore"
import { cn } from "@/lib/utils"

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const sidebarCollapsed = useAppStore((s) => s.sidebarCollapsed)

  return (
    <div
      className={cn(
        "flex min-h-screen bg-[var(--bg-main)] transition-all duration-300",
        sidebarCollapsed ? "pl-14" : "pl-56"
      )}
    >
      {children}
    </div>
  )
}
